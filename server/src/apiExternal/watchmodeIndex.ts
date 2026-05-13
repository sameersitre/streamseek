/**
 * Watchmode reverse-source index.
 *
 * Goal: enrich every dashboard list-endpoint response with `source_ids: number[]`
 * per item without paying ~1 Watchmode credit per title (which would be 200+
 * credits per dashboard refresh).
 *
 * Strategy (the "inverted lookup", documented in trovieapp/docs/watchmode-prd.md §5.1):
 *   - For each popular streaming source × each region, call
 *     `/list-titles?source_ids=<id>&regions=<R>&sort_by=popularity_desc&limit=250`
 *     ONCE and remember the resulting `(media_type, tmdb_id) -> source_id` mapping.
 *   - On every list-endpoint response, look up each item's `(media_type, tmdb_id)`
 *     and attach the matching source_ids[].
 *
 * Cost: ~POPULAR_SOURCES.length credits per region on first build, then ~0 credits for
 * 3 months (DB-cached). The in-memory index refreshes every 24 h but reloads from DB
 * for free; Watchmode is only called again when a DB doc exceeds DB_SOURCE_TTL_MS (90 days).
 */
import axios from 'axios'
import logger from '../common/logger'
import { connectMongo } from '../services/mongo'

/**
 * Watchmode source IDs we care about for dashboard badges. Subscription services
 * dominate; rental/purchase services are excluded (universally available, low signal).
 *
 * IDs are stable; canonical list documented in trovieapp/docs/watchmode-prd.md §3.5.
 * Curated for global relevance — extend cautiously: each ID adds 1 credit per region per build.
 */
const POPULAR_SOURCES: number[] = [
  203, // Netflix
  26, // Amazon Prime
  157, // Hulu
  372, // Disney+
  371, // Apple TV+
  387, // Max (formerly HBO Max)
  444, // Paramount+
  388, // Peacock
  445, // Discovery+
  79, // Crunchyroll
  376, // BritBox
  378, // AMC+
  296, // Tubi (free, but commonly searched)
  391, // Pluto TV (free, but commonly searched)
  349, // Apple TV
]

/** Build cap per Watchmode call. The API accepts up to 250 per page; 250 is the sweet spot for cost vs. coverage. */
const PAGE_LIMIT = 250

/** Time a built region-index stays valid before a fresh build is triggered. */
const INDEX_TTL_MS = 24 * 60 * 60 * 1000 // 24h

/** How long a source's title list stays valid in MongoDB before re-fetching from Watchmode. */
const DB_SOURCE_TTL_MS = 90 * 24 * 60 * 60 * 1000 // 3 months

interface RegionIndex {
  /** Composite key `${media_type}-${tmdb_id}` -> set of source_ids. Set keeps inserts dedup'd cheaply. */
  map: Map<string, Set<number>>
  /** Build wall-clock; entries are evicted when (now - builtAt) > INDEX_TTL_MS. */
  builtAt: number
}

/** In-memory per-region index. Key: 2-letter region code (uppercased). */
const indexByRegion = new Map<string, RegionIndex>()

/** Tracks an in-flight build per region so concurrent requests share the same fetch. */
const buildPromises = new Map<string, Promise<RegionIndex>>()

function compositeKey(mediaType: string, tmdbId: number): string {
  return `${mediaType}-${tmdbId}`
}

function isFresh(entry: RegionIndex | undefined): entry is RegionIndex {
  return !!entry && Date.now() - entry.builtAt < INDEX_TTL_MS
}

interface ListTitlesItem {
  id: number
  tmdb_id: number | null
  tmdb_type: 'movie' | 'tv' | null
  // Other fields exist (title, year, imdb_id, type) but we only need tmdb_id + tmdb_type.
}

/**
 * Calls Watchmode `/list-titles` once, returns the parsed `titles` array (or [] on
 * a parsable error). Soft-fails so a transient Watchmode outage doesn't take the
 * dashboard down — the worst case is missing badges for the affected source.
 */
async function fetchTitlesForSource(sourceId: number, region: string): Promise<ListTitlesItem[]> {
  const url = `${process.env.WATCHMODE_API_URL}/list-titles/`
  try {
    const response = await axios.get(url, {
      params: {
        apiKey: process.env.WATCHMODE_API_KEY,
        source_ids: sourceId,
        regions: region,
        sort_by: 'popularity_desc',
        limit: PAGE_LIMIT,
      },
      timeout: 15_000,
    })
    return Array.isArray(response.data?.titles) ? response.data.titles : []
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.warn({ sourceId, region, error: message }, 'Watchmode /list-titles call failed; index will be partial')
    return []
  }
}

/**
 * Load title lists for the given source IDs from MongoDB when fresh (< 3 months old),
 * falling back to Watchmode only for sources that are missing or expired. Newly fetched
 * data is persisted immediately so the next server restart is free.
 *
 * Sequential Watchmode calls are intentional — same rate-limit courtesy as before.
 */
async function loadSourcesFromDBOrWatchmode(
  sourceIds: number[],
  region: string,
): Promise<Map<number, ListTitlesItem[]>> {
  const db = await connectMongo()
  const ttlCutoff = new Date(Date.now() - DB_SOURCE_TTL_MS)

  // 1. Bulk DB lookup — only docs that are still within the 3-month window.
  const cached = await db
    .collection('watchmode_source_index')
    .find({ source_id: { $in: sourceIds }, region, fetched_at: { $gt: ttlCutoff } })
    .toArray()

  const cachedIds = new Set(cached.map((d) => d.source_id as number))
  const missing = sourceIds.filter((id) => !cachedIds.has(id))

  logger.info(
    { region, fromDB: cachedIds.size, fromWatchmode: missing.length },
    'Watchmode source-index DB cache check',
  )

  const result = new Map<number, ListTitlesItem[]>()

  // 2. Load from DB — zero Watchmode credits.
  for (const doc of cached) {
    result.set(doc.source_id as number, doc.titles as ListTitlesItem[])
  }

  // 3. Fetch missing sources from Watchmode and persist to DB.
  //    Only persist non-empty results — an empty array means Watchmode failed or returned
  //    nothing, and writing it would block retries for the full 3-month TTL window.
  for (const sourceId of missing) {
    const titles = await fetchTitlesForSource(sourceId, region)
    if (titles.length > 0) {
      await db
        .collection('watchmode_source_index')
        .updateOne({ source_id: sourceId, region }, { $set: { titles, fetched_at: new Date() } }, { upsert: true })
      await db.collection('counters').updateOne({ counterName: 'watchmode' }, { $inc: { counts: 1 } }, { upsert: true })
    }
    result.set(sourceId, titles)
  }

  return result
}

/**
 * Build (or rebuild) the reverse index for one region. DB-cached sources are loaded
 * for free; only sources missing or older than 3 months trigger a Watchmode call.
 * Errors on a single source don't fail the whole build.
 */
async function buildRegionIndex(region: string): Promise<RegionIndex> {
  const start = Date.now()
  logger.info({ region, sources: POPULAR_SOURCES.length }, 'Building Watchmode reverse-source index')

  const map = new Map<string, Set<number>>()
  const sourceData = await loadSourcesFromDBOrWatchmode(POPULAR_SOURCES, region)

  for (const [sourceId, titles] of sourceData) {
    for (const t of titles) {
      if (t.tmdb_id == null || t.tmdb_type == null) continue
      const key = compositeKey(t.tmdb_type, t.tmdb_id)
      let set = map.get(key)
      if (!set) {
        set = new Set<number>()
        map.set(key, set)
      }
      set.add(sourceId)
    }
  }

  const entry: RegionIndex = { map, builtAt: Date.now() }
  indexByRegion.set(region, entry)
  logger.info({ region, titles: map.size, durationMs: Date.now() - start }, 'Watchmode reverse-source index ready')
  return entry
}

/** Return a fresh index for the region, building (and deduping concurrent builds) if needed. */
async function getRegionIndex(region: string): Promise<RegionIndex> {
  const normalized = region.toUpperCase()
  const existing = indexByRegion.get(normalized)
  if (isFresh(existing)) return existing

  const inFlight = buildPromises.get(normalized)
  if (inFlight) return inFlight

  const build = buildRegionIndex(normalized).finally(() => {
    buildPromises.delete(normalized)
  })
  buildPromises.set(normalized, build)
  return build
}

/**
 * Get the cached source_ids[] for a single (media_type, tmdb_id, region) — the index
 * MUST already exist. Returns undefined when the title isn't in the popular-source
 * universe (long-tail titles legitimately have no badges).
 */
function lookup(index: RegionIndex, mediaType: string, tmdbId: number): number[] | undefined {
  const set = index.map.get(compositeKey(mediaType, tmdbId))
  return set ? Array.from(set) : undefined
}

/**
 * Attach `source_ids: number[]` to each result for which we have data.
 * Mutates `results` in place to keep allocations down — callers who need
 * an immutable copy should clone before passing in.
 *
 * Returns `true` when the index was ready and enrichment was attempted,
 * `false` on cold start (index not yet built). Callers should skip caching
 * when this returns false so stale unenriched responses are never stored.
 *
 * Cold-start strategy: if the region's index isn't built yet, fire the build in
 * the background and return WITHOUT enrichment. The first dashboard load then
 * responds in normal time (without badges); the build completes asynchronously
 * and subsequent loads get the badges. This avoids blocking ~8 parallel
 * dashboard endpoints on a 15–30s sequential Watchmode build.
 */
export async function attachSourceIds<T extends { id: number; media_type?: string }>(
  results: T[] | undefined,
  region: string | undefined,
  fallbackMediaType?: string,
): Promise<boolean> {
  if (!results || results.length === 0) return true

  const effectiveRegion = (region || 'US').toUpperCase()
  const existing = indexByRegion.get(effectiveRegion)

  if (!isFresh(existing)) {
    // Trigger background build (deduped via buildPromises). First request gets no
    // badges; subsequent requests after the build completes get the full data.
    void getRegionIndex(effectiveRegion).catch((error) => {
      const message = error instanceof Error ? error.message : String(error)
      logger.warn({ region: effectiveRegion, error: message }, 'Background Watchmode index build failed')
    })
    return false
  }

  for (const item of results) {
    const mediaType = item.media_type || fallbackMediaType
    if (!mediaType) continue
    const sourceIds = lookup(existing, mediaType, item.id)
    if (sourceIds) {
      ;(item as T & { source_ids?: number[] }).source_ids = sourceIds
    }
  }
  return true
}

/**
 * Trigger a background index build for the given region (defaults to 'US').
 * Call once at server startup so the first client request doesn't pay the cold-start penalty.
 * DB-cached data (< 3 months) loads in milliseconds; Watchmode API is only called for missing sources.
 */
export function prewarmIndex(region: string = 'US'): void {
  void getRegionIndex(region.toUpperCase()).catch((error) => {
    const message = error instanceof Error ? error.message : String(error)
    logger.warn(
      { region, error: message },
      'Watchmode index pre-warm failed — badges will appear after first successful build',
    )
  })
}
