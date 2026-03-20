import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { mediaKeys } from "./queryKeys";

export function useTopRated(mediaType: "movie" | "tv", page: number) {
  return useQuery({
    queryKey: mediaKeys.topRated(mediaType, page),
    queryFn: () => apiClient.topRated({ media_type: mediaType, page }),
    staleTime: 5 * 60 * 1000,
  });
}
