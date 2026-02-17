import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { detailKeys } from "./queryKeys";

export function useOTTPlatforms(type: string, id: string) {
  return useQuery({
    queryKey: detailKeys.ott(type, id),
    queryFn: () => apiClient.ottPlatforms({ id, media_type: type }),
    enabled: !!id,
  });
}
