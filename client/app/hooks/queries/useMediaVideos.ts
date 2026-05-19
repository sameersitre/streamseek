import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { detailKeys, DETAIL_STALE_TIME, DETAIL_GC_TIME } from "./queryKeys";
import type { ContentMediaType } from "@/app/types";

export function useMediaVideos(type: ContentMediaType, id: string) {
  return useQuery({
    queryKey: detailKeys.videos(type, id),
    queryFn: () => apiClient.videos({ id, media_type: type }),
    enabled: !!id,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
  });
}
