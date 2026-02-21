import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiClient } from "@/app/services/apiClient";
import { interactionKeys } from "./queryKeys";
import type { InteractionItem } from "@/app/types";

export function useUserInteractions() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const query = useQuery({
    queryKey: interactionKeys.userAll(),
    queryFn: () => apiClient.allInteractions(),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 min — data changes only on user action
    gcTime: 30 * 60 * 1000, // 30 min — keep in cache
  });

  const interactions = query.data?.interactions ?? [];

  const isLiked = (mediaType: string, mediaId: number): boolean =>
    interactions.some(
      (i: InteractionItem) =>
        i.mediaType === mediaType && i.mediaId === mediaId && i.liked,
    );

  const isWatchlisted = (mediaType: string, mediaId: number): boolean =>
    interactions.some(
      (i: InteractionItem) =>
        i.mediaType === mediaType && i.mediaId === mediaId && i.watchlisted,
    );

  return {
    ...query,
    interactions,
    isLiked,
    isWatchlisted,
    isAuthenticated,
  };
}
