/**
 * TVmaze character-image enrichment for TV cast (TVmaze is TV-only).
 *
 * TVmaze's /shows/{id}/cast carries a dedicated `character.image` — real
 * in-costume portraits (TMDB has none; its person images are bare headshots).
 * Free API, no key, CC BY-SA. Two requests per title, cached forever in the
 * `details_cast` doc, so the per-title cost is one-time.
 *
 * Join key is the ACTOR name, not the character name — TVmaze and TMDB
 * frequently disagree on character spelling ("Jade Herrera" vs "Jade") but
 * actor names match exactly.
 */
import axios from 'axios'
import logger from '../common/logger'
import type { TmdbCastMember } from '../types'

const TVMAZE_TIMEOUT_MS = 4000

export interface TvmazeEnrichmentResult {
  cast: TmdbCastMember[]
  /**
   * True when TVmaze definitively answered (including "show not found" /
   * "no images") — safe to stamp the doc so we never re-fetch. False on
   * transient failure (timeout/5xx) — leave the doc unstamped to retry later.
   */
  checked: boolean
}

interface TvmazeCastEntry {
  person?: { name?: string }
  character?: { image?: { original?: string; medium?: string } }
}

/** actor name (lowercased) → character image URL for one TVmaze show. */
async function fetchCharacterImageMap(imdbId: string): Promise<Map<string, string> | 'not_found' | 'unavailable'> {
  try {
    // axios follows the lookup's 301 redirect to /shows/{id} automatically.
    const { data: show } = await axios.get(`https://api.tvmaze.com/lookup/shows`, {
      params: { imdb: imdbId },
      timeout: TVMAZE_TIMEOUT_MS,
    })
    if (!show?.id) return 'not_found'

    const { data: cast } = await axios.get<TvmazeCastEntry[]>(`https://api.tvmaze.com/shows/${show.id}/cast`, {
      timeout: TVMAZE_TIMEOUT_MS,
    })
    const map = new Map<string, string>()
    for (const entry of cast ?? []) {
      const actor = entry.person?.name?.toLowerCase().trim()
      const image = entry.character?.image?.original ?? entry.character?.image?.medium
      // First credit wins — leads are listed first and their photo is the best match.
      if (actor && image && !map.has(actor)) map.set(actor, image)
    }
    return map
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return 'not_found'
    const message = error instanceof Error ? error.message : String(error)
    logger.warn({ error: message, imdbId }, 'TVmaze character-image fetch failed transiently')
    return 'unavailable'
  }
}

/**
 * Attach `character_image` to each TV cast member by actor-name match.
 * Pure enrichment: members without a TVmaze match are returned untouched.
 */
export async function enrichCastWithTvmazeImages(
  cast: TmdbCastMember[],
  imdbId: string | undefined,
): Promise<TvmazeEnrichmentResult> {
  if (!imdbId || cast.length === 0) return { cast, checked: true } // nothing to look up — confirmed no-op

  const result = await fetchCharacterImageMap(imdbId)
  if (result === 'unavailable') return { cast, checked: false }
  if (result === 'not_found') return { cast, checked: true }

  const enriched = cast.map((member) => {
    const image = result.get(member.name?.toLowerCase().trim() ?? '')
    return image ? { ...member, character_image: image } : member
  })
  const matched = enriched.filter((m) => m.character_image).length
  logger.info({ imdbId, castSize: cast.length, matched }, 'TVmaze character images attached')
  return { cast: enriched, checked: true }
}
