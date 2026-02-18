export type MediaType = "all" | "movie" | "tv";

export interface Genre {
  id: number;
  name: string;
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  media_type?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  genre_ids: number[];
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  overview?: string;
}

export interface PaginatedResponse<T> {
  status: number;
  results: T[];
  page: number;
  total_pages: number;
}
