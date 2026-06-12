export interface TrendingParams {
  media_type: 'all' | 'movie' | 'tv'
  page: number
  region?: string
}

export interface PopularParams {
  media_type: 'movie' | 'tv'
  page: number
  region?: string
}

export interface TopRatedParams {
  media_type: 'movie' | 'tv'
  page: number
  region?: string
}

/** Shared by single-page-param endpoints: nowPlaying, airingToday, onTheAir, trendingPeople */
export interface PageParams {
  page: number
  region?: string
}

// Aliases for readability in route-specific contexts
export type NowPlayingParams = PageParams
export type AiringTodayParams = PageParams
export type OnTheAirParams = PageParams
export type TrendingPeopleParams = PageParams

export interface DiscoverByGenreParams {
  genre: number
  page: number
  region?: string
}

export interface SearchParams {
  searchText: string
  page: number
  adult: boolean
  region?: string
}

export interface FilterParams {
  media_type: 'movie' | 'tv'
  page: number
  genres: string // comma-separated genre IDs
  adult: boolean
  region?: string
}

export interface UpcomingParams {
  media_type: 'movie' | 'tv'
  region: string
  adult: boolean
  page: number
}

export interface DetailsParams {
  id: number | string
  media_type: 'movie' | 'tv'
}

export interface CastDetailsParams {
  id: number | string
  media_type: 'movie' | 'tv'
}

export interface CharacterInfoParams {
  id: number | string
  media_type: 'movie' | 'tv'
  character: string
  title_name: string
  actor?: string
}

/** Response shape of POST /getCharacterInfo (and resolveCharacterBio). */
export interface CharacterBioResult {
  bio: string | null
  source?: 'wikipedia' | 'fandom'
  source_url?: string
  attribution?: string
  thumbnail?: string
  /** Why bio is null when it wasn't a content miss: monthly cap hit / API key missing. */
  reason?: 'budget' | 'config'
}

export interface SeasonsParams {
  id: number | string
  seasonNumber: number
}

export interface ExternalIDParams {
  id: number | string
  media_type: 'movie' | 'tv'
}

export interface VideosParams {
  id: number | string
  media_type: 'movie' | 'tv'
}

export interface RecommendationsParams {
  id: number | string
  media_type: 'movie' | 'tv'
  page: number
  region?: string
}

export interface Result {
  adult: boolean
  backdrop_path: string
  id: number
  title?: string
  original_language: string
  original_title?: string
  overview: string
  poster_path: string
  media_type: string
  genre_ids: number[]
  popularity: number
  release_date?: string
  video?: boolean
  vote_average: number
  vote_count: number
  name?: string
  original_name?: string
  first_air_date?: string
  origin_country?: string[]
  /** Watchmode source IDs the title is available on (stream type, region-filtered). Attached server-side via the inverted lookup index. */
  source_ids?: number[]
  /**
   * US-availability fallback. Attached ONLY for non-US regions and ONLY when the
   * title has no `source_ids` in the user's own region — pure data, no decision.
   * The client decides whether to render it (as a last resort) and tags it "(US)".
   */
  source_ids_us?: number[]
}

/* details_data */

export interface DetailsData {
  _id: string
  adult: boolean
  backdrop_path: string
  belongs_to_collection: string
  budget: number
  created_by: Createdby[]
  episode_run_time: number[]
  facebook_id?: string | null
  first_air_date: string
  freebase_id?: string | null
  freebase_mid?: string | null
  genres: Genre[]
  homepage: string
  id: number
  imdb_id: string
  in_production: boolean
  instagram_id: string
  languages: string[]
  last_air_date: string
  last_episode_to_air: Lastepisodetoair
  media_type: string
  message: string
  name: string
  networks: Network[]
  next_episode_to_air?: Lastepisodetoair | null
  number_of_episodes: number
  number_of_seasons: number
  origin_country: string[]
  original_language: string
  original_name: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string
  production_companies: Productioncompany[]
  production_countries: Productioncountry[]
  release_date: string
  revenue: number
  runtime: number
  seasons: Season[]
  spoken_languages: Spokenlanguage[]
  status: string
  tagline: string
  title: string
  tvdb_id: number
  tvrage_id?: number | null
  twitter_id: string
  type: string
  video: boolean
  vote_average: number
  vote_count: number
  wikidata_id: string
}

interface Spokenlanguage {
  english_name: string
  iso_639_1: string
  name: string
}

interface Productioncountry {
  iso_3166_1: string
  name: string
}

interface Productioncompany {
  id: number
  name: string
  logo_path?: string
  origin_country: string
}

interface Network {
  id: number
  name: string
  logo_path: string
  origin_country: string
}

interface Lastepisodetoair {
  air_date: string
  episode_number: number
  id: number
  name: string
  overview: string
  production_code: string
  runtime: number
  season_number: number
  show_id: number
  still_path: string
  vote_average: number
  vote_count: number
}

export interface Genre {
  id: number
  name: string
}

interface Createdby {
  id: number
  credit_id: string
  name: string
  gender: number
  profile_path: string
}

/* CAST */

/** One character played by a cast member — from TMDB TV `aggregate_credits`. */
export interface AggregateRole {
  credit_id: string
  character: string
  episode_count: number
}

/**
 * Raw TMDB cast member as actually stored in `details_cast` and consumed by the app
 * (the legacy `Cast` interface above does not match what this endpoint returns).
 * Movie `/credits` members carry `character`; TV `aggregate_credits` members carry
 * `roles[]` + `total_episode_count`, and we synthesize `character` from `roles[]`
 * server-side so the shipped app keeps rendering.
 */
export interface TmdbCastMember {
  adult: boolean
  gender: number
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path: string | null
  character?: string
  credit_id?: string
  order: number
  /** TV aggregate_credits only */
  roles?: AggregateRole[]
  /** TV aggregate_credits only */
  total_episode_count?: number
  /** In-costume character portrait from TVmaze (TV only), attached server-side. */
  character_image?: string
}

/* VIDEOS */
export interface Videos {
  iso_639_1: string
  iso_3166_1: string
  name: string
  key: string
  site: string
  size: number
  type: string
  official: boolean
  published_at: string
  id: string
}

/* OTT PLATFORMS */
export type OTTStreamType = 'sub' | 'rent' | 'buy' | 'free' | 'tve'

export interface OTTPlatform {
  /** Watchmode source ID — needed to derive badge `source_ids` and map local logos. */
  source_id: number
  name: string
  url: string
  icon: string
  type?: OTTStreamType
  price?: number
  region?: string
}

/* WATCHMODE API SHAPES */

/** Item from the Watchmode GET /sources/ reference endpoint (provider catalogue). */
export interface WatchmodeSourceInfo {
  id: number
  name: string
  logo_100px: string
}

/** Item from the Watchmode GET /title/{id}/sources/ endpoint (availability per title). */
export interface WatchmodeSource {
  source_id: number
  name: string
  web_url: string
  type: OTTStreamType
  price?: number
  region?: string
}

/**
 * Cached per-title streaming availability — one doc per (media_type, tmdb_id),
 * serving BOTH the dashboard badge path (`byRegion` → source_ids) and the Details
 * "Where to Watch" path (`platforms`). A single Watchmode /title/{id}/sources fetch
 * (no `regions` param) returns every plan-enabled region, so one doc covers all regions.
 * Cached 3 months (TTL index on `fetched_at`).
 */
export interface TitleSourcesDoc {
  /** Derived unique key `${media_type}-${tmdb_id}` — fast $in lookup + upsert. */
  tkey: string
  media_type: string
  tmdb_id: number
  /** Full mapped availability, all regions/types. Drives the Details screen. */
  platforms: OTTPlatform[]
  /** region (uppercase) → dedup'd badge-relevant source_ids. Drives the OTT badge. */
  byRegion: Record<string, number[]>
  /** Negative cache: true when Watchmode returned no sources (or 404). Prevents re-spend. */
  empty: boolean
  fetched_at: Date
}

export interface Crew {
  job: string
  department: string
  credit_id: string
  adult: boolean
  gender: number
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path: string
}

export interface GuestStar {
  character: string
  credit_id: string
  order: number
  adult: boolean
  gender: number
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path: string
}

export interface Episode {
  air_date: string
  episode_number: number
  id: number
  name: string
  overview: string
  production_code: string
  runtime: number
  season_number: number
  show_id: number
  still_path: string
  vote_average: number
  vote_count: number
  crew: Crew[]
  guest_stars: GuestStar[]
}

export interface Season {
  status: number
  message: string
  _id: string
  air_date: string
  episodes: Episode[]
  name: string
  overview: string
  id: number
  poster_path: string
  season_number: number
  episode_count?: number
}
