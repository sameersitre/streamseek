import type { MediaType } from "@/app/types";

/** Detail queries cache config — shared across all detail hooks */
export const DETAIL_STALE_TIME = 30 * 60 * 1000; // 30 min — skip refetch on revisit
export const DETAIL_GC_TIME = 60 * 60 * 1000;    // 60 min — keep in cache after unmount

export const mediaKeys = {
  all: ["media"] as const,
  trending: (type: MediaType, page: number) =>
    [...mediaKeys.all, "trending", type, page] as const,
  search: (text: string, page: number) =>
    [...mediaKeys.all, "search", text, page] as const,
  filter: (genres: string, page: number) =>
    [...mediaKeys.all, "filter", genres, page] as const,
  upcoming: (page: number) =>
    [...mediaKeys.all, "upcoming", page] as const,
};

export const detailKeys = {
  all: ["details"] as const,
  detail: (type: string, id: string) =>
    [...detailKeys.all, type, id] as const,
  videos: (type: string, id: string) =>
    [...detailKeys.all, "videos", type, id] as const,
  cast: (type: string, id: string) =>
    [...detailKeys.all, "cast", type, id] as const,
  ott: (type: string, id: string) =>
    [...detailKeys.all, "ott", type, id] as const,
  recommendations: (type: string, id: string, page: number) =>
    [...detailKeys.all, "recommendations", type, id, page] as const,
  seasons: (id: string, seasonNumber: number) =>
    [...detailKeys.all, "seasons", id, seasonNumber] as const,
};

export const interactionKeys = {
  all: ["interactions"] as const,
  userAll: () => [...interactionKeys.all, "all"] as const,
  watchlist: (page: number) => [...interactionKeys.all, "watchlist", page] as const,
  likes: (page: number) => [...interactionKeys.all, "likes", page] as const,
};
