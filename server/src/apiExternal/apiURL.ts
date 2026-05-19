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
  TopRatedParams,
  TrendingParams,
  TrendingPeopleParams,
  UpcomingParams,
  VideosParams,
} from '../types'

/** TMDB accepts an ISO-3166-1 region code on most endpoints. Empty string means "no filter". */
const regionParam = (region?: string) => (region ? `&region=${region}` : '')

export const trendingURL = (params: TrendingParams) =>
  `${process.env.TMDB_URL}/trending/${params.media_type}/day?page=${params.page}`

export const searchURL = (params: SearchParams) =>
  `${process.env.TMDB_URL}/search/multi?language=en-US&query=${params.searchText}&page=${params.page}&include_adult=${params.adult}${regionParam(params.region)}`

export const filterURL = (params: FilterParams) =>
  `${process.env.TMDB_URL}/discover/${params.media_type}?language=en-US&sort_by=popularity.desc&include_adult=${params.adult}&include_video=false&page=${params.page}&with_genres=${params.genres}${regionParam(params.region)}`

export const upcomingURL = (params: UpcomingParams) =>
  `${process.env.TMDB_URL}/discover/${params.media_type}?language=en-US&region=${params.region}&sort_by=popularity.desc&include_adult=${
    params.adult
  }&include_video=false&page=${params.page}&primary_release_date.gte=${new Date().toISOString()}`

export const detailsURL = (params: DetailsParams) =>
  `${process.env.TMDB_URL}/${params.media_type}/${params.id}?language=en-US`

export const castDetailsURL = (params: CastDetailsParams) =>
  `${process.env.TMDB_URL}/${params.media_type}/${params.id}/credits?language=en-US`

export const seasonsURL = (params: SeasonsParams) =>
  `${process.env.TMDB_URL}/tv/${params.id}/season/${params.seasonNumber}?language=en-US`

export const externalIDURL = (params: ExternalIDParams) =>
  `${process.env.TMDB_URL}/${params.media_type}/${params.id}/external_ids`

export const videosURL = (params: VideosParams) =>
  `${process.env.TMDB_URL}/${params.media_type}/${params.id}/videos?language=en-US`

export const recommendationsURL = (params: RecommendationsParams) =>
  `${process.env.TMDB_URL}/${params.media_type}/${params.id}/recommendations?language=en-US&page=${params.page}`

export const popularURL = (params: PopularParams) =>
  `${process.env.TMDB_URL}/${params.media_type}/popular?language=en-US&page=${params.page}${regionParam(params.region)}`

export const topRatedURL = (params: TopRatedParams) =>
  `${process.env.TMDB_URL}/${params.media_type}/top_rated?language=en-US&page=${params.page}${regionParam(params.region)}`

export const nowPlayingURL = (params: NowPlayingParams) =>
  `${process.env.TMDB_URL}/movie/now_playing?language=en-US&page=${params.page}&region=${params.region || 'US'}`

export const airingTodayURL = (params: AiringTodayParams) =>
  `${process.env.TMDB_URL}/tv/airing_today?language=en-US&page=${params.page}${regionParam(params.region)}`

export const onTheAirURL = (params: OnTheAirParams) =>
  `${process.env.TMDB_URL}/tv/on_the_air?language=en-US&page=${params.page}${regionParam(params.region)}`

export const trendingPeopleURL = (params: TrendingPeopleParams) =>
  `${process.env.TMDB_URL}/trending/person/day?page=${params.page}`

export const discoverByGenreURL = (params: DiscoverByGenreParams) =>
  `${process.env.TMDB_URL}/discover/movie?language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${params.page}&with_genres=${params.genre}${regionParam(params.region)}`
