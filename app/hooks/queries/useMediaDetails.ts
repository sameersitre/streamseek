import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { detailKeys } from "./queryKeys";

export function useMediaDetails(type: string, id: string) {
  return useQuery({
    queryKey: detailKeys.detail(type, id),
    queryFn: () => apiClient.details({ id, media_type: type }),
    enabled: !!id,
  });
}
