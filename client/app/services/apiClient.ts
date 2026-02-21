import { ENDPOINTS } from "./endpoints";
import type {
  PaginatedResponse,
  MediaItem,
  MediaDetails,
  CastMember,
  Video,
  OTTPlatform,
  Episode,
  TrendingParams,
  SearchParams,
  FilterParams,
  UpcomingParams,
  DetailsParams,
  VideosParams,
  CastParams,
  OTTParams,
  RecommendationsParams,
  SeasonsParams,
  FeedbackParams,
  ToggleParams,
  InteractionStatus,
  AllInteractionsResponse,
  PaginatedListResponse,
} from "@/app/types";

const TIMEOUT_MS = 15_000;

async function post<T>(url: string, body: object): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

export const apiClient = {
  trending(params: TrendingParams) {
    return post<PaginatedResponse<MediaItem>>(ENDPOINTS.TRENDING, params);
  },

  search(params: SearchParams) {
    return post<PaginatedResponse<MediaItem>>(ENDPOINTS.SEARCH, params);
  },

  filter(params: FilterParams) {
    return post<PaginatedResponse<MediaItem>>(ENDPOINTS.FILTER, params);
  },

  upcoming(params: UpcomingParams) {
    return post<PaginatedResponse<MediaItem>>(ENDPOINTS.UPCOMING, params);
  },

  details(params: DetailsParams) {
    return post<MediaDetails>(ENDPOINTS.DETAILS, { ...params, page: 1 });
  },

  videos(params: VideosParams) {
    return post<{ results: Video[] }>(ENDPOINTS.VIDEOS, params);
  },

  cast(params: CastParams) {
    return post<{ cast: CastMember[] }>(ENDPOINTS.CAST, params);
  },

  ottPlatforms(params: OTTParams) {
    return post<{ platforms: OTTPlatform[] }>(ENDPOINTS.OTT_PLATFORMS, params);
  },

  recommendations(params: RecommendationsParams) {
    return post<PaginatedResponse<MediaItem>>(ENDPOINTS.RECOMMENDATIONS, params);
  },

  seasons(params: SeasonsParams) {
    return post<{ episodes: Episode[] }>(ENDPOINTS.SEASONS, params);
  },

  feedback(params: FeedbackParams) {
    return post<{ status: number }>(ENDPOINTS.FEEDBACK, params);
  },

  // Interaction endpoints
  allInteractions() {
    return post<AllInteractionsResponse>(ENDPOINTS.ALL_INTERACTIONS, {});
  },

  toggleLike(params: ToggleParams) {
    return post<InteractionStatus>(ENDPOINTS.TOGGLE_LIKE, params);
  },

  toggleWatchlist(params: ToggleParams) {
    return post<InteractionStatus>(ENDPOINTS.TOGGLE_WATCHLIST, params);
  },

  watchlist(params: { page: number }) {
    return post<PaginatedListResponse>(ENDPOINTS.WATCHLIST, params);
  },

  likes(params: { page: number }) {
    return post<PaginatedListResponse>(ENDPOINTS.LIKES, params);
  },
};
