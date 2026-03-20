import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { mediaKeys } from "./queryKeys";

export function useTrendingPeople(page: number) {
  return useQuery({
    queryKey: mediaKeys.trendingPeople(page),
    queryFn: () => apiClient.trendingPeople({ page }),
    staleTime: 5 * 60 * 1000,
  });
}
