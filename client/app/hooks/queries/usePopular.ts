import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { mediaKeys } from "./queryKeys";

export function usePopular(mediaType: "movie" | "tv", page: number) {
  return useQuery({
    queryKey: mediaKeys.popular(mediaType, page),
    queryFn: () => apiClient.popular({ media_type: mediaType, page }),
    staleTime: 5 * 60 * 1000,
  });
}
