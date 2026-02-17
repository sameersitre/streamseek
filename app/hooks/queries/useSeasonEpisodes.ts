import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { detailKeys } from "./queryKeys";

export function useSeasonEpisodes(id: string, seasonNumber: number) {
  return useQuery({
    queryKey: detailKeys.seasons(id, seasonNumber),
    queryFn: () => apiClient.seasons({ id, seasonNumber }),
    enabled: !!id && seasonNumber >= 0,
  });
}
