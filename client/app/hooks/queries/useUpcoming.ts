import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { mediaKeys } from "./queryKeys";

export function useUpcoming(page: number) {
  return useQuery({
    queryKey: mediaKeys.upcoming(page),
    queryFn: () => apiClient.upcoming({ page }),
  });
}
