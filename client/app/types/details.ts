import type { Genre } from "./media";

export interface MediaDetails {
  id: number;
  title?: string;
  name?: string;
  tagline?: string;
  backdrop_path: string | null;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  genres: Genre[];
  imdb_id?: string;
  vote_average: number;
  vote_count: number;
  overview: string;
  seasons?: Season[];
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface CastMember {
  id: number;
  actor: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  type: string;
  size: number;
  site: string;
}

export interface OTTPlatform {
  icon: string;
  name: string;
  url: string;
}

export interface Season {
  id: number;
  name: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date?: string;
  overview?: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date?: string;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}
