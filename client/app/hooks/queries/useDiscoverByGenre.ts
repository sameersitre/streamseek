import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { mediaKeys } from "./queryKeys";

export function useDiscoverByGenre(genre: number, page: number, enabled = true) {
  return useQuery({
    queryKey: mediaKeys.discoverByGenre(genre, page),
    queryFn: () => apiClient.discoverByGenre({ genre, page }),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
