import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { detailKeys, DETAIL_STALE_TIME, DETAIL_GC_TIME } from "./queryKeys";
import type { ContentMediaType } from "@/app/types";

export function useMediaCast(type: ContentMediaType, id: string) {
  return useQuery({
    queryKey: detailKeys.cast(type, id),
    queryFn: () => apiClient.cast({ id, media_type: type }),
    enabled: !!id,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
  });
}
