/**
 * Normalization of raw TMDB credits payloads before they're cached in
 * `details_cast` — pure functions, no I/O, shared by the getCastDetails
 * endpoint (fresh fetch + lazy backfill paths).
 */
import type { TmdbCastMember } from '../types'

/**
 * `aggregate_credits` returns the full multi-season cast (often 100+ members vs ~20
 * from `/credits`) — cap what we store and ship so Mongo docs and the app's cast
 * grid stay bounded. 50 covers every regular + recurring character that matters.
 */
export const MAX_CAST_MEMBERS = 50

/** Marker stamped on TV docs built from `aggregate_credits` — drives the one-time backfill. */
export const CAST_SOURCE_AGGREGATE = 'aggregate_credits'

/**
 * Normalize a raw TMDB credits payload for storage. TV `aggregate_credits` members
 * have no top-level `character` (only `roles[]`) — synthesize it so the shipped app,
 * which reads `cast[].character`, keeps working. Movies pass through untouched.
 */
export function normalizeCredits(
  castDetails: { cast?: TmdbCastMember[] } & Record<string, unknown>,
  mediaType: string,
) {
  if (mediaType !== 'tv' || !Array.isArray(castDetails.cast)) return castDetails
  const cast = castDetails.cast.slice(0, MAX_CAST_MEMBERS).map((member) => ({
    ...member,
    character:
      member.character ??
      (member.roles ?? [])
        .map((role) => role.character)
        .filter(Boolean)
        .join(' / '),
  }))
  return { ...castDetails, cast, cast_source: CAST_SOURCE_AGGREGATE }
}
