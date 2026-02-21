import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { detailKeys, DETAIL_STALE_TIME, DETAIL_GC_TIME } from "./queryKeys";

export function useRecommendations(type: string, id: string, page: number = 1) {
  return useQuery({
    queryKey: detailKeys.recommendations(type, id, page),
    queryFn: () => apiClient.recommendations({ id, media_type: type, page }),
    enabled: !!id,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
  });
}
