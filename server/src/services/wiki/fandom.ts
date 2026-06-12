/**
 * Fandom fallback: guess the wiki subdomain from the title name, search it, and
 * pull the intro extract of the top hit. Entirely best-effort — wrong-slug wikis
 * are filtered by requiring the character name in the hit's page title.
 */
import axios from 'axios'
import logger from '../../common/logger'
import {
  CharacterExtractResult,
  FetchExtractParams,
  MAX_EXTRACT_CHARS,
  WIKI_TIMEOUT_MS,
  WIKI_USER_AGENT,
  stripWikitext,
} from './shared'

interface FandomSearchHit {
  title?: string
  pageid?: number
}

export async function fetchFromFandom(params: FetchExtractParams): Promise<CharacterExtractResult> {
  const { character, titleName } = params
  const slug = titleName
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/ +/g, '')
  if (!slug) return { status: 'not_found' }
  const apiBase = `https://${slug}.fandom.com/api.php`

  try {
    const { data: searchData } = await axios.get(apiBase, {
      timeout: WIKI_TIMEOUT_MS,
      headers: { 'user-agent': WIKI_USER_AGENT },
      params: {
        action: 'query',
        list: 'search',
        srsearch: character,
        srlimit: 1,
        format: 'json',
      },
    })
    const hit: FandomSearchHit | undefined = searchData?.query?.search?.[0]
    const characterLead = character.split(' ')[0].toLowerCase()
    if (!hit?.title || !hit.title.toLowerCase().includes(characterLead)) {
      return { status: 'not_found' }
    }

    // TextExtracts isn't enabled on every Fandom wiki — fetch the raw wikitext of
    // the LEAD section only (rvsection=0, core MediaWiki) and strip markup ourselves.
    const { data: revisionData } = await axios.get(apiBase, {
      timeout: WIKI_TIMEOUT_MS,
      headers: { 'user-agent': WIKI_USER_AGENT },
      params: {
        action: 'query',
        prop: 'revisions',
        rvprop: 'content',
        rvslots: 'main',
        rvsection: 0,
        pageids: hit.pageid,
        format: 'json',
      },
    })
    const wikitext: string | undefined =
      revisionData?.query?.pages?.[String(hit.pageid)]?.revisions?.[0]?.slots?.main?.['*']
    const extract = wikitext ? stripWikitext(wikitext) : ''
    if (!extract.trim()) return { status: 'not_found' }

    return {
      status: 'found',
      extract: extract.slice(0, MAX_EXTRACT_CHARS),
      source: 'fandom',
      sourceUrl: `https://${slug}.fandom.com/wiki/${encodeURIComponent(hit.title.replace(/ /g, '_'))}`,
      attribution: `Source: ${titleName} Fandom wiki · CC BY-SA`,
    }
  } catch (error) {
    // Nonexistent subdomain (DNS failure) is the expected miss path for shows
    // without a Fandom wiki — treat as a confirmed miss. Anything that reached
    // a real wiki but failed transiently must stay uncacheable.
    if (axios.isAxiosError(error) && (error.code === 'ENOTFOUND' || error.response?.status === 404)) {
      return { status: 'not_found' }
    }
    const message = error instanceof Error ? error.message : String(error)
    logger.warn({ error: message, slug }, 'Fandom extract fetch failed transiently')
    return { status: 'unavailable' }
  }
}
