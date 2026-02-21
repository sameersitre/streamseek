import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiClient } from "@/app/services/apiClient";
import { interactionKeys } from "./queryKeys";

export function useUserWatchlist(page: number = 1) {
  const { status } = useSession();

  return useQuery({
    queryKey: interactionKeys.watchlist(page),
    queryFn: () => apiClient.watchlist({ page }),
    enabled: status === "authenticated",
  });
}
