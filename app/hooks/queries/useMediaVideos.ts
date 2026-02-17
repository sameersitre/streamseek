import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { detailKeys } from "./queryKeys";

export function useMediaVideos(type: string, id: string) {
  return useQuery({
    queryKey: detailKeys.videos(type, id),
    queryFn: () => apiClient.videos({ id, media_type: type }),
    enabled: !!id,
  });
}
