/**
 * Shared contract + helpers for the wiki extract fetchers (Wikipedia, Fandom,
 * title-article fallback). Every fetcher returns a `CharacterExtractResult` so
 * the bio resolver can tell a CONFIRMED miss (safe to negative-cache) from a
 * transient outage (must NOT be cached, or one hiccup poisons the character).
 */

// Per-request budget. Cold Fandom requests (DNS + TLS) take 2-4s, and Fandom's
// wildcard DNS makes NONEXISTENT wikis hang rather than 404 — so the timeout is
// also our exit from that hang. The app's fetch timeout is 15s and the LLM step
// needs ~3-6s, so the whole wiki stage must stay well under ~8s.
export const WIKI_TIMEOUT_MS = 3500

// Wikimedia rejects generic client UAs (403) — their API policy requires an
// identifying User-Agent with contact info.
export const WIKI_USER_AGENT = 'TrovieApp/1.0 (https://sameersitre.dev; sameersitre@gmail.com)'

/** Bound what we feed the LLM — Fandom intros can run to tens of KB. */
export const MAX_EXTRACT_CHARS = 4000

/**
 * Title articles need more room than character pages: the character material
 * lives in Plot/Cast sections that start after the lead. ~9k chars ≈ 2.3k input
 * tokens ≈ $0.002 per generation at Haiku pricing — still negligible.
 */
export const TITLE_ARTICLE_MAX_CHARS = 9000

export interface CharacterExtract {
  status: 'found'
  extract: string
  source: 'wikipedia' | 'fandom'
  sourceUrl: string
  attribution: string
  thumbnail?: string
}

export interface CharacterExtractMiss {
  /** `not_found`: all sources answered and had nothing. `unavailable`: a source was unreachable. */
  status: 'not_found' | 'unavailable'
}

export type CharacterExtractResult = CharacterExtract | CharacterExtractMiss

export interface FetchExtractParams {
  character: string
  titleName: string
  actorName?: string
}

/** Per-variant probe outcome used by the parallel fetchers. */
export type ProbeOutcome = CharacterExtract | 'not_found' | 'unavailable'

/** Collapse parallel probe outcomes: first hit wins (variant order = priority). */
export function firstHitOrMiss(probes: ProbeOutcome[]): CharacterExtractResult {
  for (const probe of probes) {
    if (typeof probe !== 'string') return probe
  }
  return { status: probes.includes('unavailable') ? 'unavailable' : 'not_found' }
}

/**
 * Name spellings worth looking up for a credited character name. TMDB credit
 * strings often don't match the wiki article title:
 *  - `Hugh 'Hughie' Campbell` → article is "Hughie Campbell"
 *  - `Annie January / Starlight` → article is "Starlight (character)"
 */
export function characterNameVariants(character: string): string[] {
  const names = [character]
  // Quoted nickname: try nickname-as-name and the formal name without it.
  const nick = character.match(/^(\S+)\s+['"](.+?)['"]\s+(.+)$/)
  if (nick) names.push(`${nick[2]} ${nick[3]}`, `${nick[1]} ${nick[3]}`)
  // Alias names ("A / B"): try each segment on its own.
  if (character.includes('/')) {
    names.push(
      ...character
        .split('/')
        .map((part) => part.trim())
        .filter(Boolean),
    )
  }
  return [...new Set(names)]
}

/**
 * Reduce lead-section wikitext to plain prose: drop {{templates}} (balanced),
 * <ref>/HTML tags, [[link|label]] syntax, bold/italic quotes and headings.
 * Residual markup is fine — the LLM summarizes and INSUFFICIENT-guards garbage.
 */
export function stripWikitext(wikitext: string): string {
  let withoutTemplates = ''
  let depth = 0
  for (let i = 0; i < wikitext.length; i++) {
    if (wikitext.startsWith('{{', i)) {
      depth++
      i++
      continue
    }
    if (depth > 0 && wikitext.startsWith('}}', i)) {
      depth--
      i++
      continue
    }
    if (depth === 0) withoutTemplates += wikitext[i]
  }
  return withoutTemplates
    .replace(/<ref[^>]*\/>/gi, '')
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[\[(?:File|Image)[^\]]*\]\]/gi, '')
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1')
    .replace(/'{2,}/g, '')
    .replace(/^=+.*=+\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
