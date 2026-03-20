import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { mediaKeys } from "./queryKeys";

export function useAiringToday(page: number) {
  return useQuery({
    queryKey: mediaKeys.airingToday(page),
    queryFn: () => apiClient.airingToday({ page }),
    staleTime: 5 * 60 * 1000,
  });
}
