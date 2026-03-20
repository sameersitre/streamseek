import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { mediaKeys } from "./queryKeys";

export function useNowPlaying(page: number) {
  return useQuery({
    queryKey: mediaKeys.nowPlaying(page),
    queryFn: () => apiClient.nowPlaying({ page }),
    staleTime: 5 * 60 * 1000,
  });
}
