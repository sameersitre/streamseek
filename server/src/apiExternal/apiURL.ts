import {
  CastDetailsParams,
  DetailsParams,
  ExternalIDParams,
  FilterParams,
  RecommendationsParams,
  SearchParams,
  SeasonsParams,
  TrendingParams,
  UpcomingParams,
  VideosParams,
} from '../types'

export const trendingURL = (params: TrendingParams) =>
  `${process.env.TMDB_URL}/trending/${params.media_type}/day?page=${params.page}`

export const searchURL = (params: SearchParams) =>
  `${process.env.TMDB_URL}/search/multi?language=en-US&query=${params.searchText}&page=${params.page}&include_adult=${params.adult}`

export const filterURL = (params: FilterParams) =>
  `${process.env.TMDB_URL}/discover/${params.media_type}?language=en-US&sort_by=popularity.desc&include_adult=${params.adult}&include_video=false&page=${params.page}&with_genres=${params.genres}`

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
