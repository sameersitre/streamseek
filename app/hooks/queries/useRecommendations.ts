import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { detailKeys } from "./queryKeys";

export function useRecommendations(type: string, id: string) {
  return useQuery({
    queryKey: detailKeys.recommendations(type, id),
    queryFn: () => apiClient.recommendations({ id, media_type: type }),
    enabled: !!id,
  });
}
