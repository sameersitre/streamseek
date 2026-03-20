import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { mediaKeys } from "./queryKeys";

export function useOnTheAir(page: number) {
  return useQuery({
    queryKey: mediaKeys.onTheAir(page),
    queryFn: () => apiClient.onTheAir({ page }),
    staleTime: 5 * 60 * 1000,
  });
}
