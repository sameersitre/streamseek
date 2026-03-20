import type { MediaType } from "./media";

export interface TrendingParams {
  media_type: MediaType;
  page: number;
}

export interface SearchParams {
  searchText: string;
  page: number;
}

export interface FilterParams {
  media_type: MediaType;
  genres: string;
  page: number;
}

export interface UpcomingParams {
  media_type: "movie" | "tv";
  region: string;
  adult: boolean;
  page: number;
}

export interface DetailsParams {
  id: string;
  media_type: string;
  page?: number;
}

export interface VideosParams {
  id: string;
  media_type: string;
}

export interface CastParams {
  id: string;
  media_type: string;
}

export interface OTTParams {
  id: string;
  media_type: string;
}

export interface RecommendationsParams {
  id: string;
  media_type: string;
  page?: number;
}

export interface SeasonsParams {
  id: string;
  seasonNumber: number;
}

export interface FeedbackParams {
  email: string;
  message: string;
}

export interface PopularParams {
  media_type: "movie" | "tv";
  page: number;
}

export interface TopRatedParams {
  media_type: "movie" | "tv";
  page: number;
}

export interface NowPlayingParams {
  page: number;
}

export interface AiringTodayParams {
  page: number;
}

export interface OnTheAirParams {
  page: number;
}

export interface TrendingPeopleParams {
  page: number;
}

export interface DiscoverByGenreParams {
  genre: number;
  page: number;
}
