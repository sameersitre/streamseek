/**
 * Wikipedia per-character probes: REST page/summary across name variants
 * ("X (Title)", "X (character)", bare name; nickname / alias-segment spellings),
 * all in parallel — first relevant hit wins.
 */
import axios from 'axios'
import {
  CharacterExtractResult,
  FetchExtractParams,
  MAX_EXTRACT_CHARS,
  ProbeOutcome,
  WIKI_TIMEOUT_MS,
  WIKI_USER_AGENT,
  characterNameVariants,
  firstHitOrMiss,
} from './shared'

interface WikipediaSummary {
  type?: string
  title?: string
  extract?: string
  thumbnail?: { source?: string }
  content_urls?: { desktop?: { page?: string } }
}

/** True when the page plausibly describes THIS title's character (not a random namesake). */
function isRelevant(summary: WikipediaSummary, { titleName, actorName }: FetchExtractParams): boolean {
  if (!summary.extract || summary.type === 'disambiguation') return false
  // A character query that redirects to the show's own article would trivially
  // mention the title — reject when the page IS the title.
  if (summary.title?.toLowerCase() === titleName.toLowerCase()) return false
  const haystack = summary.extract.toLowerCase()
  return haystack.includes(titleName.toLowerCase()) || (!!actorName && haystack.includes(actorName.toLowerCase()))
}

/** Wikipedia REST page/summary across name + disambiguation variants, probed in parallel. */
export async function fetchFromWikipedia(params: FetchExtractParams): Promise<CharacterExtractResult> {
  const { character, titleName } = params
  const variants = characterNameVariants(character).flatMap((name) => [
    `${name} (${titleName})`,
    `${name} (character)`,
    name,
  ])

  const probes = await Promise.all(
    variants.map(async (variant): Promise<ProbeOutcome> => {
      const title = encodeURIComponent(variant.normalize('NFC').replace(/ /g, '_'))
      try {
        const { data } = await axios.get<WikipediaSummary>(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
          { timeout: WIKI_TIMEOUT_MS, headers: { accept: 'application/json', 'user-agent': WIKI_USER_AGENT } },
        )
        if (!isRelevant(data, params)) return 'not_found'
        return {
          status: 'found',
          extract: data.extract!.slice(0, MAX_EXTRACT_CHARS),
          source: 'wikipedia',
          sourceUrl: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${title}`,
          attribution: 'Source: Wikipedia · CC BY-SA',
          thumbnail: data.thumbnail?.source,
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) return 'not_found'
        return 'unavailable' // timeout / DNS / 5xx — caller must not negative-cache
      }
    }),
  )

  return firstHitOrMiss(probes)
}
