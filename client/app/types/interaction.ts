export interface InteractionItem {
  mediaId: number;
  mediaType: string;
  liked: boolean;
  watchlisted: boolean;
}

export interface InteractionStatus {
  liked: boolean;
  watchlisted: boolean;
}

export interface ToggleParams {
  mediaId: number;
  mediaType: string;
  title: string;
  posterPath: string | null;
  voteAverage: number;
}

export interface AllInteractionsResponse {
  interactions: InteractionItem[];
}

export interface WatchlistItem {
  mediaId: number;
  mediaType: string;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  updatedAt: string;
}

export interface PaginatedListResponse {
  results: WatchlistItem[];
  total: number;
  page: number;
  totalPages: number;
}
