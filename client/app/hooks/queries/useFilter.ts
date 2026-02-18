import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { mediaKeys } from "./queryKeys";

export function useFilter(genres: string, page: number) {
  return useQuery({
    queryKey: mediaKeys.filter(genres, page),
    queryFn: () =>
      apiClient.filter({ media_type: "movie", genres, page }),
    enabled: genres.length > 0,
  });
}
