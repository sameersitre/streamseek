export type ContentMediaType = "movie" | "tv";
export type MediaType = "all" | ContentMediaType;

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

export interface PersonItem {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: MediaItem[];
  media_type: "person";
  popularity: number;
  gender?: number;
}

export interface PaginatedResponse<T> {
  status: number;
  results: T[];
  page: number;
  total_pages: number;
}
