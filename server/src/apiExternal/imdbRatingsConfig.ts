/**
 * Shared constants for the IMDb-rating (OMDb) cache and the tmdb→imdb id map.
 *
 * Dependency-free on purpose: both the resolver (`apiExternal/imdbRatings.ts`) and the
 * index setup (`services/mongo.ts`) import these, and a direct import between those two
 * would form a circular dependency (imdbRatings → mongo → imdbRatings).
 *
 * The cache is PERMANENT by design: OMDb's free tier is only 1,000 req/day, so each title
 * is fetched from OMDb exactly once and then served from MongoDB forever. Only the
 * negative-cache (a title with no IMDb data) self-heals, so coverage grows over time.
 */

/** MongoDB collection holding cached IMDb ratings (one doc per imdb_id). */
export const IMDB_RATINGS_COLLECTION = 'imdb_ratings'
/**
 * Real ratings are permanent (no TTL). Only `empty:true` negative-cache docs expire — a
 * title with no IMDb rating today may get one later, so we re-check after 90 days.
 */
export const IMDB_RATINGS_NEGATIVE_TTL_SECONDS = 90 * 24 * 60 * 60

/** MongoDB collection mapping `${media_type}-${tmdb_id}` → imdb_id (TMDB external_ids). */
export const TMDB_IMDB_COLLECTION = 'tmdb_imdb'
