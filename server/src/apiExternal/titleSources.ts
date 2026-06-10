/**
 * Per-title Watchmode streaming-availability resolver + cache.
 *
 * Replaces the old reverse-source index (which only badged titles in the top-250
 * popularity slice of 15 curated sources). For each title we call Watchmode
 * `GET /title/{type}-{id}/sources` ONCE — without a `regions` param it returns every
 * plan-enabled region — and cache the result in MongoDB (`title_sources`) for 3 months.
 *
 * One doc per (media_type, tmdb_id) serves BOTH consumers:
 *   - dashboard badge → `byRegion[region]` (region-filtered source_ids)
 *   - Details "Where to Watch" → `platforms` (full mapped availability)
 *
 * Cost control: every live fetch is gated by the monthly budget (watchmodeBudget.ts)
 * and de-duplicated in-flight, so the ~8 parallel dashboard endpoints requesting the
 * same title in one load fetch it only once. Cold start is lazy: list responses attach
 * whatever is already cached and enqueue a budget-guarded, concurrency-capped background
 * fill for misses — badges appear on the next load.
 */
import { fetchOTTPlatforms } from './apiExternal'
import { TITLE_SOURCES_COLLECTION as COLLECTION, TITLE_SOURCES_TTL_MS } from './titleSourcesConfig'
import { connectMongo } from '../services/mongo'
import { canSpendWatchmode, incrementMonthlyCounter, type WatchmodeSpendPurpose } from '../services/watchmodeBudget'
import logger from '../common/logger'
import type { OTTPlatform, OTTStreamType, TitleSourcesDoc } from '../types'

/** Stream types that earn a badge. Excludes rent/buy (universally available, low signal). */
const BADGE_TYPES = new Set<OTTStreamType>(['sub', 'free', 'tve'])

/** Max concurrent background badge fetches. */
const BACKGROUND_CONCURRENCY = 3

/** De-dupes concurrent live fetches of the same title (mirrors the old buildPromises pattern). */
const inFlight = new Map<string, Promise<TitleSourcesDoc | null>>()

export function titleKey(mediaType: string, tmdbId: number): string {
  return `${mediaType}-${tmdbId}`
}

function isFetchable(mediaType: string | undefined): mediaType is 'movie' | 'tv' {
  return mediaType === 'movie' || mediaType === 'tv'
}

/** Group a title's platforms into region → dedup'd badge-relevant source_ids. */
function buildByRegion(platforms: OTTPlatform[]): Record<string, number[]> {
  const byRegion: Record<string, Set<number>> = {}
  for (const p of platforms) {
    if (!p.region || p.source_id == null) continue
    if (p.type && !BADGE_TYPES.has(p.type)) continue
    const region = p.region.toUpperCase()
    ;(byRegion[region] ??= new Set<number>()).add(p.source_id)
  }
  const out: Record<string, number[]> = {}
  for (const [region, set] of Object.entries(byRegion)) out[region] = Array.from(set)
  return out
}

function buildDoc(mediaType: string, tmdbId: number, platforms: OTTPlatform[]): TitleSourcesDoc {
  const byRegion = buildByRegion(platforms)
  return {
    tkey: titleKey(mediaType, tmdbId),
    media_type: mediaType,
    tmdb_id: tmdbId,
    platforms,
    byRegion,
    empty: platforms.length === 0,
    fetched_at: new Date(),
  }
}

/**
 * Native MongoDB driver collection for the title cache. We use the driver collection
 * (`connection.db`) rather than the mongoose `connection.collection()` wrapper: the
 * wrapper's `.find()` does not expose `.toArray()` in the deployed mongoose build
 * (cursor ops throw "toArray is not a function"), whereas the native cursor always does.
 * Matches the native-collection pattern already used for index creation in mongo.ts.
 */
async function titleCol() {
  const conn = await connectMongo()
  return conn.db!.collection(COLLECTION)
}

async function upsertDoc(doc: TitleSourcesDoc): Promise<void> {
  const col = await titleCol()
  await col.updateOne({ tkey: doc.tkey }, { $set: doc }, { upsert: true })
}

/**
 * Read a cached title doc by key. `requireFresh` adds the 3-month TTL filter (the normal
 * badge/Details read); pass false to accept a stale doc as a Watchmode-outage fallback.
 * Never calls Watchmode.
 */
async function findTitleDoc(mediaType: string, tmdbId: number, requireFresh: boolean): Promise<TitleSourcesDoc | null> {
  const col = await titleCol()
  const filter: Record<string, unknown> = { tkey: titleKey(mediaType, tmdbId) }
  if (requireFresh) filter.fetched_at = { $gt: new Date(Date.now() - TITLE_SOURCES_TTL_MS) }
  const doc = await col.findOne(filter)
  return (doc as TitleSourcesDoc | null) ?? null
}

/**
 * Live-fetch a title's sources from Watchmode, map + cache, increment the monthly counter.
 * Budget-guarded and in-flight-deduped. On budget exhaustion or transient outage, returns
 * the stale cached doc (or null) without spending a credit. A 404 (unknown title) is
 * negative-cached so it isn't retried for 3 months.
 */
async function fetchAndStoreTitleSources(
  mediaType: string,
  tmdbId: number,
  purpose: WatchmodeSpendPurpose,
): Promise<TitleSourcesDoc | null> {
  if (!isFetchable(mediaType)) return null

  const key = titleKey(mediaType, tmdbId)
  const existing = inFlight.get(key)
  if (existing) return existing

  const promise = (async (): Promise<TitleSourcesDoc | null> => {
    if (!(await canSpendWatchmode(purpose))) {
      logger.warn({ key, purpose }, 'Watchmode monthly budget reached — serving cache only')
      return findTitleDoc(mediaType, tmdbId, false)
    }
    try {
      const platforms = await fetchOTTPlatforms(mediaType, tmdbId)
      await incrementMonthlyCounter()
      const doc = buildDoc(mediaType, tmdbId, platforms)
      await upsertDoc(doc)
      return doc
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status
      if (status === 404) {
        // Title unknown to Watchmode — negative-cache so we don't retry for 3 months.
        await incrementMonthlyCounter()
        const doc = buildDoc(mediaType, tmdbId, [])
        await upsertDoc(doc)
        return doc
      }
      // Transient (network/5xx/timeout) — soft-fail, no write, no credit. Serve stale if any.
      const message = error instanceof Error ? error.message : String(error)
      logger.warn({ key, status, error: message }, 'Watchmode title sources fetch failed (transient)')
      return findTitleDoc(mediaType, tmdbId, false)
    }
  })().finally(() => inFlight.delete(key))

  inFlight.set(key, promise)
  return promise
}

/**
 * Resolve a single title's sources for the Details screen: fresh cache hit, otherwise an
 * on-demand (user-triggered, higher-priority) Watchmode fetch.
 */
export async function resolveTitleSources(mediaType: string, tmdbId: number): Promise<TitleSourcesDoc | null> {
  const fresh = await findTitleDoc(mediaType, tmdbId, true)
  if (fresh) return fresh
  return fetchAndStoreTitleSources(mediaType, tmdbId, 'details')
}

/** Run async tasks with a bounded concurrency. */
async function runPool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++]
      await fn(item)
    }
  })
  await Promise.all(workers)
}

/** Background-fill cache misses (badge priority, concurrency-capped). Fire-and-forget. */
function backgroundFill(misses: Array<{ mediaType: string; tmdbId: number }>): void {
  void runPool(misses, BACKGROUND_CONCURRENCY, async ({ mediaType, tmdbId }) => {
    try {
      await fetchAndStoreTitleSources(mediaType, tmdbId, 'badge')
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.warn({ mediaType, tmdbId, error: message }, 'Background badge fill failed')
    }
  }).catch(() => {
    /* pool itself never rejects meaningfully; individual errors already swallowed */
  })
}

/**
 * Attach `source_ids` (region-filtered) to each list result from the per-title cache.
 *
 * Signature preserved from the old reverse-index module so callers don't change.
 * One bulk indexed `$in` Mongo lookup; cache hits attach synchronously, cache misses are
 * enqueued for a budget-guarded background fill (badges appear on the next request).
 * For non-US regions with no in-region availability, attaches `source_ids_us` (US fallback)
 * — free, since one fetch already cached every region. Persons / typeless items are skipped.
 *
 * Mutates `results` in place. Always returns `true` (no cold-start caching gate anymore).
 */
export async function attachSourceIds<T extends { id: number; media_type?: string }>(
  results: T[] | undefined,
  region: string | undefined,
  fallbackMediaType?: string,
): Promise<boolean> {
  if (!results || results.length === 0) return true
  const effectiveRegion = (region || 'US').toUpperCase()

  // Resolve each item's (media_type, tmdb_id); skip persons and anything not movie/tv.
  const items = results
    .map((item) => ({ item, mediaType: item.media_type || fallbackMediaType }))
    .filter((x): x is { item: T; mediaType: 'movie' | 'tv' } => isFetchable(x.mediaType))

  if (items.length === 0) return true

  const keys = Array.from(new Set(items.map((x) => titleKey(x.mediaType, x.item.id))))
  const cutoff = new Date(Date.now() - TITLE_SOURCES_TTL_MS)

  const col = await titleCol()
  const docs = (await col
    .find({ tkey: { $in: keys }, fetched_at: { $gt: cutoff } })
    .toArray()) as unknown as TitleSourcesDoc[]

  const byKey = new Map<string, TitleSourcesDoc>()
  for (const doc of docs) byKey.set(doc.tkey, doc)

  const misses = new Map<string, { mediaType: 'movie' | 'tv'; tmdbId: number }>()

  for (const { item, mediaType } of items) {
    const key = titleKey(mediaType, item.id)
    const doc = byKey.get(key)
    if (!doc) {
      misses.set(key, { mediaType, tmdbId: item.id })
      continue
    }
    const regional = doc.byRegion?.[effectiveRegion]
    if (regional && regional.length > 0) {
      ;(item as T & { source_ids?: number[] }).source_ids = regional
    } else if (effectiveRegion !== 'US') {
      const us = doc.byRegion?.['US']
      if (us && us.length > 0) (item as T & { source_ids_us?: number[] }).source_ids_us = us
    }
  }

  if (misses.size > 0) backgroundFill(Array.from(misses.values()))
  return true
}
