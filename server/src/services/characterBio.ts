/**
 * Character-bio resolution: permanent Mongo cache → wiki extract → Haiku summary.
 *
 * One doc per (media_id, media_type, character_norm) in `character_bios`.
 * Confirmed misses (no wiki page, LLM says INSUFFICIENT) are negative-cached as
 * `{status:'not_found'}`; transient failures (wiki outage, Anthropic 429/5xx,
 * missing API key, budget exhausted) are returned UNCACHED so they retry later.
 *
 * `resolveCharacterBio` is per-character and side-effect-complete, so the
 * on-demand endpoint and the future batch-per-title job share it directly.
 */
import { connectMongo } from './mongo'
import { fetchCharacterExtract, fetchTitleArticleExtract } from './wiki'
import { generateCharacterBio, isAnthropicApiError } from './anthropic'
import { canSpendAnthropic, incrementAnthropicCounter } from './anthropicBudget'
import logger from '../common/logger'
import type { CharacterBioResult, TmdbCastMember } from '../types'

const COLLECTION = 'character_bios'

/** Strip TMDB credit qualifiers — "(voice)", "(uncredited)", "(archive footage)"… */
export function stripCreditSuffixes(character: string): string {
  return character.replace(/\s*\((voice|uncredited|archive footage|credit only)[^)]*\)/gi, '').trim()
}

/** Cache-key normalization: suffix-stripped, NFC, lowercased, whitespace-collapsed. */
export function normalizeCharacter(character: string): string {
  return stripCreditSuffixes(character).normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Non-fictional appearances ("Self", "Himself - Host", …) never get a bio. */
export function isSelfCharacter(character: string): boolean {
  return /^(self|himself|herself|themselves)\b/i.test(character.trim())
}

export interface ResolveBioParams {
  mediaId: number | string
  mediaType: 'movie' | 'tv'
  character: string
  titleName: string
  actorName?: string
}

export async function resolveCharacterBio(params: ResolveBioParams): Promise<CharacterBioResult> {
  const { mediaId, mediaType, titleName, actorName } = params
  const character = stripCreditSuffixes(params.character)
  const characterNorm = normalizeCharacter(params.character)

  if (!characterNorm || isSelfCharacter(character)) return { bio: null }

  const db = await connectMongo()
  // The app posts ids as strings, curl/tests often as numbers — normalize so one
  // character can't occupy two cache slots (and pay the LLM twice).
  const cacheKey = { media_id: Number(mediaId), media_type: mediaType, character_norm: characterNorm }

  const cached = await db.collection(COLLECTION).findOne(cacheKey)
  if (cached) {
    if (cached.status === 'not_found') return { bio: null }
    return {
      bio: cached.bio,
      source: cached.source,
      source_url: cached.source_url,
      attribution: cached.attribution,
      thumbnail: cached.thumbnail ?? undefined,
    }
  }

  // Grounding source: a page about the character itself when one exists, else
  // the title's own Wikipedia article (most movie characters have no standalone
  // page, but the film's Plot/Cast sections describe them).
  let extract = await fetchCharacterExtract({ character, titleName, actorName })
  let grounding: 'character_page' | 'title_article' = 'character_page'
  let sawUnavailable = extract.status === 'unavailable'

  if (extract.status !== 'found') {
    const articleExtract = await fetchTitleArticleExtract({ character, titleName, actorName, mediaType })
    if (articleExtract.status === 'found') {
      extract = articleExtract
      grounding = 'title_article'
    } else {
      sawUnavailable = sawUnavailable || articleExtract.status === 'unavailable'
      // Confirmed miss on BOTH paths → negative-cache; any outage → uncached retry.
      if (!sawUnavailable) await negativeCache(cacheKey, character, titleName)
      return { bio: null }
    }
  }

  if (!(await canSpendAnthropic())) {
    logger.warn({ mediaId, characterNorm }, 'Anthropic monthly budget exhausted — bio generation refused')
    return { bio: null, reason: 'budget' }
  }

  const started = Date.now()
  let generated
  try {
    generated = await generateCharacterBio({
      character,
      titleName,
      mediaType,
      actorName,
      extract: extract.extract,
      grounding,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'config') return { bio: null, reason: 'config' }
    if (isAnthropicApiError(error)) {
      // Rate limit, outage, or account problem (e.g. exhausted credit balance).
      // Says nothing about the character — respond null, cache nothing.
      logger.warn(
        { mediaId, characterNorm, status: error.status, error: error.message },
        'Anthropic API error — bio not cached',
      )
      return { bio: null, reason: 'config' }
    }
    throw error
  }
  await incrementAnthropicCounter()

  if (!generated) {
    // Model judged the extract insufficient/off-topic — confirmed, cacheable miss.
    await negativeCache(cacheKey, character, titleName)
    return { bio: null }
  }

  logger.info(
    {
      media_id: mediaId,
      character_norm: characterNorm,
      source: extract.source,
      grounding,
      durationMs: Date.now() - started,
      input_tokens: generated.inputTokens,
      output_tokens: generated.outputTokens,
    },
    'Character bio generated',
  )

  const doc = {
    ...cacheKey,
    character,
    actor: actorName ?? null,
    title_name: titleName,
    bio: generated.bio,
    source: extract.source,
    source_url: extract.sourceUrl,
    attribution: extract.attribution,
    thumbnail: extract.thumbnail ?? null,
    grounding,
    model: generated.model,
    created_at: new Date(),
  }
  await insertIgnoringDuplicate(doc)

  return {
    bio: generated.bio,
    source: extract.source,
    source_url: extract.sourceUrl,
    attribution: extract.attribution,
    thumbnail: extract.thumbnail,
  }
}

/**
 * Future batch-per-title mode: pre-generate bios for a title's top cast. Loops the
 * same per-character resolver the endpoint uses; stops early once the budget is hit.
 * Not routed yet — wire behind `requireInternalAuth` (or a cron) when enabling.
 */
export async function batchGenerateForTitle(
  mediaId: number | string,
  mediaType: 'movie' | 'tv',
  titleName: string,
  topN = 10,
): Promise<{ generated: number; skipped: number }> {
  const db = await connectMongo()
  const castDoc = await db.collection('details_cast').findOne({ id: mediaId, media_type: mediaType })
  const cast: TmdbCastMember[] = (castDoc?.cast ?? []).slice(0, topN)

  let generated = 0
  let skipped = 0
  for (const member of cast) {
    const character = member.roles?.[0]?.character ?? member.character ?? ''
    const result = await resolveCharacterBio({
      mediaId,
      mediaType,
      character,
      titleName,
      actorName: member.name,
    })
    if (result.reason === 'budget') break
    result.bio ? generated++ : skipped++
  }
  return { generated, skipped }
}

async function negativeCache(
  cacheKey: { media_id: number | string; media_type: string; character_norm: string },
  character: string,
  titleName: string,
) {
  await insertIgnoringDuplicate({
    ...cacheKey,
    character,
    title_name: titleName,
    status: 'not_found',
    created_at: new Date(),
  })
}

/** Two devices tapping the same character race on the unique index — last insert is a no-op. */
async function insertIgnoringDuplicate(doc: Record<string, unknown>) {
  try {
    const db = await connectMongo()
    await db.collection(COLLECTION).insertOne(doc)
  } catch (error) {
    const isDuplicate = typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000
    if (!isDuplicate) throw error
  }
}
