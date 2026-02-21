import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { detailKeys, DETAIL_STALE_TIME, DETAIL_GC_TIME } from "./queryKeys";

export function useSeasonEpisodes(id: string, seasonNumber: number) {
  return useQuery({
    queryKey: detailKeys.seasons(id, seasonNumber),
    queryFn: () => apiClient.seasons({ id, seasonNumber }),
    enabled: !!id && seasonNumber >= 0,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
  });
}
