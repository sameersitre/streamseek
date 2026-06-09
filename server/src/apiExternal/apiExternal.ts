import axios from 'axios'
import logger from '../common/logger'
import type { WatchmodeSourceInfo, WatchmodeSource } from '../types'

// Cache source logos from Watchmode /sources/ reference endpoint (provider id → logo URL).
// Populated lazily on first call; safe to share across requests since provider logos don't change.
const sourceLogos: Record<number, string> = {}

const getSourceLogos = async (): Promise<Record<number, string>> => {
  if (Object.keys(sourceLogos).length > 0) return sourceLogos
  const res = await axios.get(`${process.env.WATCHMODE_API_URL}/sources/?apiKey=${process.env.WATCHMODE_API_KEY}`)
  for (const s of res.data as WatchmodeSourceInfo[]) {
    sourceLogos[s.id] = s.logo_100px
  }
  logger.info(`Watchmode sources cached: ${Object.keys(sourceLogos).length} providers`)
  return sourceLogos
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
