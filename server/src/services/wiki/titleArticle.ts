/**
 * Fallback grounding when no per-character page exists anywhere (the common case
 * for movie characters — only iconic ones get standalone articles): the title's
 * OWN Wikipedia article. Its Plot/Cast sections usually describe the main
 * characters, and the LLM is instructed to write only about the requested one.
 */
import axios from 'axios'
import {
  CharacterExtractResult,
  FetchExtractParams,
  ProbeOutcome,
  TITLE_ARTICLE_MAX_CHARS,
  WIKI_TIMEOUT_MS,
  WIKI_USER_AGENT,
  characterNameVariants,
  firstHitOrMiss,
} from './shared'

export async function fetchTitleArticleExtract(
  params: FetchExtractParams & { mediaType: 'movie' | 'tv' },
): Promise<CharacterExtractResult> {
  const { character, titleName, mediaType } = params
  const suffixed = mediaType === 'movie' ? `${titleName} (film)` : `${titleName} (TV series)`
  // Suffixed form first — the bare title can be an unrelated primary topic
  // ("From" the preposition). The mention-check below filters those anyway.
  const variants = [suffixed, titleName]

  const probes = await Promise.all(
    variants.map(async (variant): Promise<ProbeOutcome> => {
      try {
        const { data } = await axios.get(`https://en.wikipedia.org/w/api.php`, {
          timeout: WIKI_TIMEOUT_MS,
          headers: { 'user-agent': WIKI_USER_AGENT },
          params: {
            action: 'query',
            prop: 'extracts',
            explaintext: 1,
            redirects: 1,
            titles: variant.normalize('NFC'),
            format: 'json',
          },
        })
        const pages = data?.query?.pages ?? {}
        const page = Object.values(pages)[0] as { title?: string; extract?: string; missing?: string } | undefined
        if (!page?.extract || page.missing !== undefined) return 'not_found'

        // The article must actually talk about this character — full credited
        // name, or any name segment (prose says "Boyd", credits say "Boyd Stevens").
        const article = page.extract.toLowerCase()
        const nameTokens = characterNameVariants(character)
          .flatMap((name) => [name, ...name.split(/\s+/)])
          .filter((token) => token.length >= 3)
        if (!nameTokens.some((token) => article.includes(token.toLowerCase()))) return 'not_found'

        return {
          status: 'found',
          extract: page.extract.slice(0, TITLE_ARTICLE_MAX_CHARS),
          source: 'wikipedia',
          sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent((page.title ?? variant).replace(/ /g, '_'))}`,
          attribution: 'Source: Wikipedia · CC BY-SA',
        }
      } catch {
        return 'unavailable'
      }
    }),
  )

  return firstHitOrMiss(probes)
}
