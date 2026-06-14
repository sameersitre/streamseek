import axios from 'axios'
import fs from 'fs'
import path from 'path'
import logger from '../common/logger'
import type { WatchmodeSourceInfo, WatchmodeSource } from '../types'

// --- Source-logo catalogue (Watchmode /sources/: provider id → logo URL) ---
//
// This is static reference data that almost never changes, but the Watchmode key has a
// finite plan quota. Three hardening rules keep a quota-exhausted key from ever breaking
// logos (and from being hammered into a permanent 429):
//   1. Durable snapshot — the catalogue is persisted to disk on first success and reloaded
//      at startup, so a dead/over-quota key never empties the catalogue. The snapshot lives
//      outside `dist/` (which `prebuild` wipes) so it survives rebuilds; commit it for
//      cross-deploy persistence, or regenerate with `scripts/fetch-source-logos.ts`.
//   2. In-flight dedup — concurrent cold-start callers share ONE Watchmode request instead
//      of each firing their own (the old race that helped burn the quota).
//   3. Failure backoff + graceful degrade — on a failed fetch we back off (don't re-hit the
//      key on every request) and return whatever we have ({} if nothing) rather than throwing,
//      so `/getSourceLogos` and `fetchOTTPlatforms` keep working and clients fall back to
//      their bundled logos.

const SNAPSHOT_PATH =
  process.env.SOURCE_LOGOS_SNAPSHOT_PATH ?? path.resolve(process.cwd(), 'data', 'sourceLogos.snapshot.json')
const FAILURE_BACKOFF_MS = 10 * 60 * 1000 // after a failed fetch, wait this long before retrying Watchmode

let sourceLogos: Record<number, string> = {}
let inFlight: Promise<Record<number, string>> | null = null
let lastFailureAt = 0

/** Best-effort load of the persisted snapshot at module init (synchronous, never throws). */
const loadSnapshot = (): void => {
  try {
    if (!fs.existsSync(SNAPSHOT_PATH)) return
    const parsed = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf-8')) as Record<string, string>
    for (const [id, logo] of Object.entries(parsed)) sourceLogos[Number(id)] = logo
    logger.info(`Watchmode sources loaded from snapshot: ${Object.keys(sourceLogos).length} providers`)
  } catch (err) {
    logger.warn(`Failed to load source logos snapshot: ${(err as Error).message}`)
  }
}
loadSnapshot()

/** Persist the in-memory catalogue so it survives restarts even if the key later dies. */
const persistSnapshot = (): void => {
  try {
    fs.mkdirSync(path.dirname(SNAPSHOT_PATH), { recursive: true })
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(sourceLogos, null, 2))
    logger.info(`Watchmode sources snapshot written (${Object.keys(sourceLogos).length} providers) → ${SNAPSHOT_PATH}`)
  } catch (err) {
    logger.warn(`Failed to persist source logos snapshot: ${(err as Error).message}`)
  }
}

const fetchSourcesFromWatchmode = async (): Promise<Record<number, string>> => {
  const res = await axios.get(`${process.env.WATCHMODE_API_URL}/sources/?apiKey=${process.env.WATCHMODE_API_KEY}`)
  const map: Record<number, string> = {}
  for (const s of res.data as WatchmodeSourceInfo[]) map[s.id] = s.logo_100px
  return map
}

export const getSourceLogos = async (): Promise<Record<number, string>> => {
  // Already have the catalogue (memory or loaded snapshot) — never block on Watchmode.
  if (Object.keys(sourceLogos).length > 0) return sourceLogos
  // Recently failed (e.g. 429 over-quota) — back off and serve what we have ({} → client fallback).
  if (Date.now() - lastFailureAt < FAILURE_BACKOFF_MS) return sourceLogos
  // First (or post-backoff) fetch — concurrent callers share this single request.
  if (!inFlight) {
    inFlight = fetchSourcesFromWatchmode()
      .then((map) => {
        sourceLogos = map
        logger.info(`Watchmode sources cached: ${Object.keys(sourceLogos).length} providers`)
        persistSnapshot()
        return sourceLogos
      })
      .catch((err) => {
        lastFailureAt = Date.now()
        logger.warn(
          `Watchmode /sources fetch failed (serving ${Object.keys(sourceLogos).length} cached): ${
            (err as Error).message
          }`,
        )
        return sourceLogos // degrade gracefully instead of throwing
      })
      .finally(() => {
        inFlight = null
      })
  }
  return inFlight
}

export const fetchOTTPlatforms = async (mediaType: string, tmdbId: string | number) => {
  const titleId = `${mediaType}-${tmdbId}` // e.g. "movie-550" or "tv-1396"
  const url = `${process.env.WATCHMODE_API_URL}/title/${titleId}/sources/?apiKey=${process.env.WATCHMODE_API_KEY}`

  const [response, logos] = await Promise.all([axios.get(url), getSourceLogos()])
  logger.info(`Watchmode API called for ${titleId}, got ${response.data?.length ?? 0} sources`)

  return (response.data as WatchmodeSource[]).map((s) => ({
    source_id: s.source_id,
    name: s.name,
    url: s.web_url,
    icon: logos[s.source_id] ?? '',
    type: s.type,
    price: s.price,
    region: s.region,
  }))
}
