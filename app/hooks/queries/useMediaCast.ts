import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { detailKeys } from "./queryKeys";

export function useMediaCast(type: string, id: string) {
  return useQuery({
    queryKey: detailKeys.cast(type, id),
    queryFn: () => apiClient.cast({ id, media_type: type }),
    enabled: !!id,
  });
}
