import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { mediaKeys } from "./queryKeys";
import type { MediaType } from "@/app/types";

export function useTrending(mediaType: MediaType, page: number) {
  return useQuery({
    queryKey: mediaKeys.trending(mediaType, page),
    queryFn: () => apiClient.trending({ media_type: mediaType, page }),
  });
}
