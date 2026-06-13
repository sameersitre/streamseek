import {
  AiringTodayParams,
  CastDetailsParams,
  DetailsParams,
  DiscoverByGenreParams,
  ExternalIDParams,
  FilterParams,
  NowPlayingParams,
  OnTheAirParams,
  PopularParams,
  RecommendationsParams,
  SearchParams,
  SeasonsParams,
  SpotlightParams,
  TopRatedParams,
  TrendingParams,
  UpcomingParams,
  VideosParams,
} from '../types'

// ── Input sanitizers ──────────────────────────────────────────────────────
// Body params are interpolated into the TMDB URL (path AND query), so every
// value must be constrained or it can smuggle extra query params / escape the
// path segment. media_type and id sit in the PATH (highest risk); region/page/
// query sit in the query string.

/** PATH segment — only ever 'movie' or 'tv' reaches the URL (blocks path injection). */
const safeMediaType = (mt: unknown): 'movie' | 'tv' => (mt === 'tv' ? 'tv' : 'movie')

/** PATH id — numeric only; a non-numeric coerces to 0 (→ TMDB 404) rather than injecting. */
const safeId = (id: unknown): number => {
  const n = Number(id)
  return Number.isInteger(n) && n > 0 ? n : 0
}

/** Query page — positive integer, defaults to 1. */
const safePage = (p: unknown): number => {
  const n = Math.floor(Number(p))
  return Number.isFinite(n) && n > 0 ? n : 1
}

/** Query region — ISO-3166-1 alpha-2 only; anything else is dropped. */
const safeRegion = (region?: unknown): string =>
  typeof region === 'string' && /^[A-Za-z]{2}$/.test(region) ? region.toUpperCase() : ''

/** include_adult — strict boolean (never raw passthrough). */
const adultFlag = (adult: unknown): boolean => adult === true || adult === 'true'

/** TMDB accepts an ISO-3166-1 region code on most endpoints. Empty string means "no filter". */
const regionParam = (region?: string) => {
  const r = safeRegion(region)
  return r ? `&region=${r}` : ''
}

export const trendingURL = (params: TrendingParams) =>
  // media_type here is 'all' | 'movie' | 'tv'; 'all' is valid for /trending only.
  `${process.env.TMDB_URL}/trending/${params.media_type === 'movie' || params.media_type === 'tv' ? params.media_type : 'all'}/day?page=${safePage(params.page)}`

export const searchURL = (params: SearchParams) =>
  `${process.env.TMDB_URL}/search/multi?language=en-US&query=${encodeURIComponent(params.searchText ?? '')}&page=${safePage(params.page)}&include_adult=${adultFlag(params.adult)}${regionParam(params.region)}`

export const filterURL = (params: FilterParams) =>
  `${process.env.TMDB_URL}/discover/${safeMediaType(params.media_type)}?language=en-US&sort_by=popularity.desc&include_adult=${adultFlag(params.adult)}&include_video=false&page=${safePage(params.page)}&with_genres=${encodeURIComponent(params.genres ?? '')}${regionParam(params.region)}`

export const upcomingURL = (params: UpcomingParams) =>
  `${process.env.TMDB_URL}/discover/${safeMediaType(params.media_type)}?language=en-US${regionParam(params.region)}&sort_by=popularity.desc&include_adult=${adultFlag(
    params.adult,
  )}&include_video=false&page=${safePage(params.page)}&primary_release_date.gte=${new Date().toISOString().slice(0, 10)}`

export const detailsURL = (params: DetailsParams) =>
  // `release_dates` (movies only) gives per-region, per-type theatrical/digital dates so
  // the client can derive exact "in theatres vs coming soon vs streaming" instead of a
  // 60-day heuristic. It's a sub-resource appended to the same call — no extra TMDB request.
  `${process.env.TMDB_URL}/${safeMediaType(params.media_type)}/${safeId(params.id)}?language=en-US${
    safeMediaType(params.media_type) === 'movie' ? '&append_to_response=release_dates' : ''
  }`

export const castDetailsURL = (params: CastDetailsParams) =>
  // TV uses `aggregate_credits`: full multi-season cast with per-character `roles[]`
  // (character + episode_count) instead of `/credits`, which only covers the latest
  // season and omits episode counts. Movies keep plain `/credits`.
  safeMediaType(params.media_type) === 'tv'
    ? `${process.env.TMDB_URL}/tv/${safeId(params.id)}/aggregate_credits?language=en-US`
    : `${process.env.TMDB_URL}/movie/${safeId(params.id)}/credits?language=en-US`

export const seasonsURL = (params: SeasonsParams) =>
  `${process.env.TMDB_URL}/tv/${safeId(params.id)}/season/${Math.max(0, Math.floor(Number(params.seasonNumber)) || 0)}?language=en-US`

export const externalIDURL = (params: ExternalIDParams) =>
  `${process.env.TMDB_URL}/${safeMediaType(params.media_type)}/${safeId(params.id)}/external_ids`

export const videosURL = (params: VideosParams) =>
  `${process.env.TMDB_URL}/${safeMediaType(params.media_type)}/${safeId(params.id)}/videos?language=en-US`

export const recommendationsURL = (params: RecommendationsParams) =>
  `${process.env.TMDB_URL}/${safeMediaType(params.media_type)}/${safeId(params.id)}/recommendations?language=en-US&page=${safePage(params.page)}`

export const popularURL = (params: PopularParams) =>
  `${process.env.TMDB_URL}/${safeMediaType(params.media_type)}/popular?language=en-US&page=${safePage(params.page)}${regionParam(params.region)}`

export const topRatedURL = (params: TopRatedParams) =>
  `${process.env.TMDB_URL}/${safeMediaType(params.media_type)}/top_rated?language=en-US&page=${safePage(params.page)}${regionParam(params.region)}`

export const nowPlayingURL = (params: NowPlayingParams) =>
  `${process.env.TMDB_URL}/movie/now_playing?language=en-US&page=${safePage(params.page)}&region=${safeRegion(params.region) || 'US'}`

export const airingTodayURL = (params: AiringTodayParams) =>
  `${process.env.TMDB_URL}/tv/airing_today?language=en-US&page=${safePage(params.page)}${regionParam(params.region)}`

export const onTheAirURL = (params: OnTheAirParams) =>
  `${process.env.TMDB_URL}/tv/on_the_air?language=en-US&page=${safePage(params.page)}${regionParam(params.region)}`

/** Sorts the discover endpoint may request — whitelisted to block arbitrary passthrough. */
const ALLOWED_DISCOVER_SORTS = [
  'popularity.desc',
  'vote_average.desc',
  'primary_release_date.desc',
  'first_air_date.desc',
  'revenue.desc',
] as const

/**
 * Generalized discover URL (drives genre rows AND the varied Documentaries tab).
 * Everything beyond the primary genre is optional + validated to prevent param
 * injection (raw values are interpolated into the TMDB query string):
 *  - genre2     → AND'd with the primary genre (with_genres=99,10402)
 *  - withKeywords → with_keywords; restricted to digits/`,`(AND)/`|`(OR)
 *  - sortBy     → whitelisted; date-sorts auto-clamp `.lte` to today and use the
 *                 media-type-correct date field (primary_release_date vs first_air_date)
 *  - voteCountGte → vote_count.gte floor (keeps vote-count-0 junk out of rating/date sorts)
 */
export const discoverByGenreURL = (params: DiscoverByGenreParams) => {
  const mediaType = safeMediaType(params.media_type)
  const dateField = mediaType === 'tv' ? 'first_air_date' : 'primary_release_date'

  // with_genres: primary (required, positive int) + optional AND'd second genre.
  const primary = safeId(params.genre)
  const second = params.genre2 != null ? safeId(params.genre2) : 0
  const genres = [primary, second].filter((g) => g > 0).join(',')

  // sort_by: whitelist; normalize a release-date sort to this media type's field.
  let sortBy: string = ALLOWED_DISCOVER_SORTS.includes(params.sort_by as never)
    ? (params.sort_by as string)
    : 'popularity.desc'
  if (sortBy === 'primary_release_date.desc' || sortBy === 'first_air_date.desc') {
    sortBy = `${dateField}.desc`
  }

  let url =
    `${process.env.TMDB_URL}/discover/${mediaType}?language=en-US` +
    `&sort_by=${sortBy}&include_adult=${adultFlag(params.adult)}&include_video=false&page=${safePage(params.page)}` +
    `&with_genres=${genres}${regionParam(params.region)}`

  // vote_count floor — required by rating/date sorts so obscure vc=0 titles don't lead.
  if (params.vote_count_gte != null && Number.isFinite(Number(params.vote_count_gte))) {
    url += `&vote_count.gte=${Number(params.vote_count_gte)}`
  }
  // Recency sort: clamp upper bound to today so unreleased / stale-metadata titles are excluded.
  if (sortBy === `${dateField}.desc`) {
    url += `&${dateField}.lte=${new Date().toISOString().slice(0, 10)}`
  }
  // with_keywords: digits + separators only (`,`=AND, `|`=OR). Reject anything else
  // (prevents injecting extra query params via a crafted keyword string).
  if (params.with_keywords && /^[0-9|,]+$/.test(params.with_keywords)) {
    url += `&with_keywords=${params.with_keywords}`
  }
  return url
}

/** Tunables for the curated "Acclaimed & Notable" hero list (see getSpotlight). */
export const SPOTLIGHT_VOTE_AVG_GTE = 6.5
export const SPOTLIGHT_MOVIE_VOTES = 300
export const SPOTLIGHT_TV_VOTES = 100
export const SPOTLIGHT_WINDOW_DAYS = 180
export const SPOTLIGHT_MAX = 12

/**
 * Curated discover query for the hero: popular AND well-rated AND released in the
 * recency window — distinct from raw trending. The date FIELD differs by media
 * type (movie: primary_release_date, tv: first_air_date); TV uses a lower
 * vote-count floor since shows accrue fewer votes than films.
 */
export const curatedDiscoverURL = (mediaType: 'movie' | 'tv', params: SpotlightParams) => {
  const now = new Date()
  const from = new Date(now.getTime() - SPOTLIGHT_WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const iso = (d: Date) => d.toISOString().slice(0, 10) // YYYY-MM-DD
  const dateField = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date'
  const votes = mediaType === 'movie' ? SPOTLIGHT_MOVIE_VOTES : SPOTLIGHT_TV_VOTES
  // Optional genre scope (Categories filter). safeId guards the path/query.
  const genre = mediaType === 'movie' ? params.movie_genre : params.tv_genre
  const genreFilter = genre != null && safeId(genre) > 0 ? `&with_genres=${safeId(genre)}` : ''
  return (
    `${process.env.TMDB_URL}/discover/${mediaType}?language=en-US&sort_by=popularity.desc` +
    `&include_video=false&include_adult=${adultFlag(params.adult)}&page=1` +
    `&vote_average.gte=${SPOTLIGHT_VOTE_AVG_GTE}&vote_count.gte=${votes}` +
    `&${dateField}.gte=${iso(from)}&${dateField}.lte=${iso(now)}${genreFilter}` +
    regionParam(params.region)
  )
}
