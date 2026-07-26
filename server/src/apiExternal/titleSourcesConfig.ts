/**
 * Shared constants for the per-title Watchmode sources cache.
 *
 * Dependency-free on purpose: both the resolver (`apiExternal/titleSources.ts`) and the
 * index setup (`services/mongo.ts`) import these, and a direct import between those two
 * would form a circular dependency (titleSources → mongo → titleSources).
 */

/** MongoDB collection holding cached per-title streaming availability. */
export const TITLE_SOURCES_COLLECTION = 'title_sources'

/**
 * Cache lifetime — re-fetch a title's sources at most once per 3 months. The Mongo TTL
 * index (`expireAfterSeconds`) and the app-level `fetched_at > cutoff` read filter both
 * derive from this single value, so they can never drift apart.
 */
export const TITLE_SOURCES_TTL_MS = 90 * 24 * 60 * 60 * 1000
export const TITLE_SOURCES_TTL_SECONDS = TITLE_SOURCES_TTL_MS / 1000
