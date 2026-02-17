import {
  ActorDetailsParams,
  CastDetailsParams,
  DetailsParams,
  ExternalIDParams,
  FilterParams,
  OttStreamUtellyParams,
  OttStreamWatchmodeParams,
  RecommendationsParams,
  SearchParams,
  SeasonsParams,
  TrendingParams,
  UpcomingParams,
  VideosParams,
} from '../types'

export const testURL = () =>
  `https://api.themoviedb.org/3/discover/movie?api_key=a2d451cdbcf87912820b3b17b82514c3&language=en-US&region=IN&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&primary_release_date.gte=2020-10-22T18%3A42%3A00.155Z`

export const trendingURL = (params: TrendingParams) =>
  `${process.env.TMDB_URL}/trending/${params.media_type}/day?page=${params.page}`

export const searchURL = (params: SearchParams) =>
  `${process.env.TMDB_URL}/search/multi?language=en-US&query=${params.searchText}&page=${params.page}&include_adult=${params.adult}`

export const filterURL = (params: FilterParams) =>
  `${process.env.TMDB_URL}/discover/${params.media_type}?language=en-US&sort_by=popularity.desc&include_adult=${params.adult}&include_video=false&page=${params.page}&with_genres=${params.genres}`

export const upcomingURL = (params: UpcomingParams) =>
  `https://api.themoviedb.org/3/discover/${params.media_type}?language=en-US&region=${params.region}&sort_by=popularity.desc&include_adult=${
    params.adult
  }&include_video=false&page=${params.page}&primary_release_date.gte=${new Date().toISOString()}`

// `https://api.themoviedb.org/3/movie/now_playing?api_key=a2d451cdbcf87912820b3b17b82514c3&language=en-US&page=${params.page}&region=US`

export const detailsURL = (params: DetailsParams) =>
  `${process.env.TMDB_URL}/${params.media_type}/${params.id}?language=en-US`

// export const castDetailsURL = (params: RequestParams) =>
//   `https://imdb-internet-movie-database-unofficial.p.rapidapi.com/film/${params.imdb_id}`

export const castDetailsURL = (params: CastDetailsParams) =>
  `${process.env.TMDB_URL}/${params.media_type}/${params.id}/credits?language=en-US`

export const actorDetailsURL = (params: ActorDetailsParams) =>
  `${process.env.TMDB_URL}/find/${params.actor_id}?language=en-US&external_source=imdb_id`

export const seasonsURL = (params: SeasonsParams) =>
  `${process.env.TMDB_URL}/tv/${params.id}/season/${params.seasonNumber}?language=en-US`

export const externalIDURL = (params: ExternalIDParams) =>
  `${process.env.TMDB_URL}/${params.media_type}/${params.id}/external_ids`

export const videosURL = (params: VideosParams) =>
  `${process.env.TMDB_URL}/${params.media_type}/${params.id}/videos?language=en-US`

export const recommendationsURL = (params: RecommendationsParams) =>
  `${process.env.TMDB_URL}/${params.media_type}/${params.id}/recommendations?language=en-US&page=${params.page}`

export const ottStreamUtellyURL = (params: OttStreamUtellyParams) =>
  `${process.env.RAPIDAPI_UTELLY_URL}?source_id=${params.id}&source=tmdb`

export const ottStreamFromWatchmodeURL = (params: OttStreamWatchmodeParams) =>
  `${process.env.RAPIDAPI_WATCHMODE_URL}/title/${params.media_type}-${params.id}/sources/`
