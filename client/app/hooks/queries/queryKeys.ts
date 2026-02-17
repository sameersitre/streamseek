import type { MediaType } from "@/app/types";

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
  recommendations: (type: string, id: string) =>
    [...detailKeys.all, "recommendations", type, id] as const,
  seasons: (id: string, seasonNumber: number) =>
    [...detailKeys.all, "seasons", id, seasonNumber] as const,
};
