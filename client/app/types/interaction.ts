import type { ContentMediaType } from "./media";

/** Fields shared by any object that references a specific piece of media. */
interface MediaRef {
  mediaId: number;
  mediaType: ContentMediaType;
}

export interface InteractionItem extends MediaRef {
  liked: boolean;
  watchlisted: boolean;
}

export interface InteractionStatus {
  liked: boolean;
  watchlisted: boolean;
}

export interface ToggleParams extends MediaRef {
  title: string;
  posterPath: string | null;
  voteAverage: number;
}

export interface AllInteractionsResponse {
  interactions: InteractionItem[];
}

export interface WatchlistItem extends MediaRef {
  title: string;
  posterPath: string | null;
  voteAverage: number;
  updatedAt: string;
}

export interface PaginatedListResponse<T = WatchlistItem> {
  results: T[];
  total: number;
  page: number;
  totalPages: number;
}
