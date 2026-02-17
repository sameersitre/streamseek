import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { mediaKeys } from "./queryKeys";

export function useSearch(text: string, page: number) {
  return useQuery({
    queryKey: mediaKeys.search(text, page),
    queryFn: () => apiClient.search({ searchText: text, page }),
    enabled: text.length > 1,
  });
}
