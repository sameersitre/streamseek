/**
 * IMDb rating resolver + PERMANENT MongoDB cache (sourced from OMDb).
 *
 * OMDb's free tier is only 1,000 requests/day, so each title is fetched from OMDb exactly
 * ONCE and then served from MongoDB forever (`imdb_ratings`). A title with no IMDb rating is
 * negative-cached but self-heals after 90 days (partial TTL — see imdbRatingsConfig.ts).
 *
 * Two caches:
 *   - `tmdb_imdb`  : `${media_type}-${tmdb_id}` → imdb_id (from TMDB external_ids). TMDB list
 *                    responses don't carry imdb_id, so the hero/spotlight enrichment resolves
 *                    it here first. Permanent (imdb_id is immutable); only successful
 *                    resolutions are stored (a rare miss just re-asks TMDB next time).
 *   - `imdb_ratings`: imdb_id → { imdb_rating, imdb_votes } (from OMDb).
 *
 * Both live fetches are de-duplicated in-flight and fail soft (return null, never throw) so a
 * missing rating degrades to the TMDB fallback on the client.
 */
import axios from 'axios'
import { axiosFetch } from './apiCall'
import { externalIDURL } from './apiURL'
import {
  IMDB_RATINGS_COLLECTION,
  TMDB_IMDB_COLLECTION,
} from './imdbRatingsConfig'
import { connectMongo } from '../services/mongo'
import logger from '../common/logger'
import type { ImdbRating, OmdbResponse } from '../types'

/** Max concurrent enrichments (mirrors titleSources' background-fill cap). */
const ENRICH_CONCURRENCY = 3

const ratingInFlight = new Map<string, Promise<ImdbRating | null>>()
const idInFlight = new Map<string, Promise<string | null>>()

const omdbBase = () => process.env.OMDB_API_URL || 'https://www.omdbapi.com'

async function col(name: string) {
  const conn = await connectMongo()
  return conn.db!.collection(name)
}

function isFetchable(mediaType: string | undefined): mediaType is 'movie' | 'tv' {
  return mediaType === 'movie' || mediaType === 'tv'
}

// --- tmdb_id → imdb_id (TMDB external_ids), permanent cache ---

function idKey(mediaType: string, tmdbId: number): string {
  return `${mediaType}-${tmdbId}`
}

export async function resolveImdbId(mediaType: string, tmdbId: number): Promise<string | null> {
  if (!isFetchable(mediaType)) return null
  const key = idKey(mediaType, tmdbId)

  const cache = await col(TMDB_IMDB_COLLECTION)
  const cached = await cache.findOne({ tkey: key })
  if (cached) return (cached.imdb_id as string | null) ?? null

  const existing = idInFlight.get(key)
  if (existing) return existing

  const promise = (async (): Promise<string | null> => {
    try {
      const ext = await axiosFetch<{ imdb_id?: string | null }>(
        externalIDURL({ media_type: mediaType, id: tmdbId }),
      )
      const imdbId = ext?.imdb_id || null
      // Only persist successful resolutions (permanent). A null just re-asks TMDB next
      // time — TMDB isn't the rate-limited quota, OMDb is.
      if (imdbId) {
        await cache.updateOne(
          { tkey: key },
          { $set: { tkey: key, imdb_id: imdbId, fetched_at: new Date() } },
          { upsert: true },
        )
      }
      return imdbId
    } catch (error) {
      logger.warn(
        { key, err: error instanceof Error ? error.message : String(error) },
        'resolveImdbId (TMDB external_ids) failed',
      )
      return null
    }
  })().finally(() => idInFlight.delete(key))

  idInFlight.set(key, promise)
  return promise
}

// --- imdb_id → rating (OMDb), permanent cache ---

function parseRating(raw: string | undefined): number | null {
  if (!raw || raw === 'N/A') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function parseVotes(raw: string | undefined): number {
  if (!raw || raw === 'N/A') return 0
  const n = Number(raw.replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

export async function getImdbRating(imdbId: string): Promise<ImdbRating | null> {
  if (!imdbId) return null

  const cache = await col(IMDB_RATINGS_COLLECTION)
  const cached = await cache.findOne({ imdb_id: imdbId })
  if (cached) {
    return cached.empty
      ? null
      : { imdb_rating: cached.imdb_rating as number, imdb_votes: cached.imdb_votes as number }
  }

  const apiKey = process.env.OMDB_API_KEY
  if (!apiKey) {
    logger.warn('OMDB_API_KEY not set — skipping IMDb rating lookup')
    return null
  }

  const existing = ratingInFlight.get(imdbId)
  if (existing) return existing

  const promise = (async (): Promise<ImdbRating | null> => {
    try {
      const { data } = await axios.get<OmdbResponse>(`${omdbBase()}/`, {
        params: { apikey: apiKey, i: imdbId },
      })

      const negativeCache = async () =>
        cache.updateOne(
          { imdb_id: imdbId },
          { $set: { imdb_id: imdbId, empty: true, fetched_at: new Date() } },
          { upsert: true },
        )

      if (data.Response === 'False') {
        // Auth/quota failures are TRANSIENT — never poison the permanent cache with a
        // negative (an invalid key or a hit daily limit would otherwise hide ratings for
        // 90 days even after it's fixed). Only a genuine "not found" is negative-cached.
        if (/api key|limit reached/i.test(data.Error ?? '')) {
          logger.warn({ imdbId, omdbError: data.Error }, 'OMDb transient error — not caching')
          return null
        }
        await negativeCache()
        return null
      }

      const rating = parseRating(data.imdbRating)
      if (rating == null) {
        // Title exists but has no IMDb rating yet — negative-cache (self-heals in 90 days).
        await negativeCache()
        return null
      }
      const votes = parseVotes(data.imdbVotes)
      // Permanent positive cache (no TTL): fetched from OMDb once, served from Mongo forever.
      await cache.updateOne(
        { imdb_id: imdbId },
        { $set: { imdb_id: imdbId, imdb_rating: rating, imdb_votes: votes, empty: false, fetched_at: new Date() } },
        { upsert: true },
      )
      return { imdb_rating: rating, imdb_votes: votes }
    } catch (error) {
      // Transient (network/quota/5xx) — soft-fail, no write, so we retry later.
      logger.warn(
        { imdbId, err: error instanceof Error ? error.message : String(error) },
        'OMDb rating fetch failed',
      )
      return null
    }
  })().finally(() => ratingInFlight.delete(imdbId))

  ratingInFlight.set(imdbId, promise)
  return promise
}

// --- list enrichment (spotlight hero) ---

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

/**
 * Attach `imdb_id` + `imdb_rating` + `imdb_votes` to each movie/tv result (in place).
 *
 * Used by the spotlight hero, whose TMDB results lack imdb_id. Resolves imdb_id then the
 * rating per item, concurrency-capped. After the first time per title both lookups are
 * permanent Mongo cache hits (no TMDB / OMDb calls), so this is cheap on subsequent
 * spotlight rebuilds. Items that don't resolve simply keep no imdb fields (client falls
 * back to TMDB). Never throws.
 */
export async function attachImdbRatings<
  T extends {
    id: number
    media_type?: string
    imdb_id?: string
    imdb_rating?: number
    imdb_votes?: number
  },
>(results: T[] | undefined): Promise<void> {
  if (!results || results.length === 0) return
  const items = results.filter((r) => isFetchable(r.media_type))
  if (items.length === 0) return

  await runPool(items, ENRICH_CONCURRENCY, async (item) => {
    const imdbId = await resolveImdbId(item.media_type as string, item.id)
    if (!imdbId) return
    item.imdb_id = imdbId
    const rating = await getImdbRating(imdbId)
    if (rating) {
      item.imdb_rating = rating.imdb_rating
      item.imdb_votes = rating.imdb_votes
    }
  })
}
