export interface TrendingParams {
  media_type: 'all' | 'movie' | 'tv'
  page: number
}

export interface PopularParams {
  media_type: 'movie' | 'tv'
  page: number
}

export interface TopRatedParams {
  media_type: 'movie' | 'tv'
  page: number
}

/** Shared by single-page-param endpoints: nowPlaying, airingToday, onTheAir, trendingPeople */
export interface PageParams {
  page: number
}

// Aliases for readability in route-specific contexts
export type NowPlayingParams = PageParams
export type AiringTodayParams = PageParams
export type OnTheAirParams = PageParams
export type TrendingPeopleParams = PageParams

export interface DiscoverByGenreParams {
  genre: number
  page: number
}

export interface SearchParams {
  searchText: string
  page: number
  adult: boolean
}

export interface FilterParams {
  media_type: 'movie' | 'tv'
  page: number
  genres: string // comma-separated genre IDs
  adult: boolean
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
}

export interface RootObject {
  status: number
  message: string
  page: number
  results: Result[]
  total_pages: number
  total_results: number
  platforms: OTTPlatform[]
  cast: Cast[]
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
}

/* details_data */

export interface DetailsData {
  _id: string
  adult: boolean
  backdrop_path: string
  belongs_to_collection: string
  budget: number
  created_by: Createdby[]
  episode_run_time: unknown[]
  facebook_id?: unknown
  first_air_date: string
  freebase_id?: unknown
  freebase_mid?: unknown
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
  next_episode_to_air?: unknown
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
  tvrage_id?: unknown
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

interface Genre {
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
export interface Cast {
  actor: string
  avatar: string
  avatar_hq: string
  actor_id: string
  character: string
  profile_path: string
  job?: string
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
export interface OTTPlatform {
  name: string
  url: string
  icon: string
  type?: string   // "sub", "rent", "buy", "free", "tve"
  price?: number
  region?: string
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
