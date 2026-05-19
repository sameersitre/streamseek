import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { detailKeys, DETAIL_STALE_TIME, DETAIL_GC_TIME } from "./queryKeys";
import type { ContentMediaType } from "@/app/types";

export function useMediaDetails(type: ContentMediaType, id: string) {
  return useQuery({
    queryKey: detailKeys.detail(type, id),
    queryFn: () => apiClient.details({ id, media_type: type }),
    enabled: !!id,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
  });
}
