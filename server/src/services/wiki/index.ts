/**
 * Best-effort character-extract fetching across Wikipedia and Fandom, plus the
 * title-article fallback. Both sources are CC BY-SA — the caller surfaces
 * attribution in the UI.
 */
import { fetchFromFandom } from './fandom'
import { fetchFromWikipedia } from './wikipedia'
import type { CharacterExtractResult, FetchExtractParams } from './shared'

export { fetchTitleArticleExtract } from './titleArticle'
export type { CharacterExtract, CharacterExtractMiss, CharacterExtractResult, FetchExtractParams } from './shared'

/**
 * Wikipedia preferred (cleaner prose, thumbnails); Fandom covers the long tail.
 * Both probes run in PARALLEL — sequential probing pushed worst-case latency
 * (3 Wikipedia variants + a hanging wildcard-DNS Fandom subdomain) past the
 * app's request timeout. A wasted Fandom query on a Wikipedia hit is free.
 */
export async function fetchCharacterExtract(params: FetchExtractParams): Promise<CharacterExtractResult> {
  const [wikipedia, fandom] = await Promise.all([fetchFromWikipedia(params), fetchFromFandom(params)])
  if (wikipedia.status === 'found') return wikipedia
  if (fandom.status === 'found') return fandom

  // Confirmed miss only when BOTH sources definitively answered "nothing here".
  return wikipedia.status === 'unavailable' || fandom.status === 'unavailable'
    ? { status: 'unavailable' }
    : { status: 'not_found' }
}
