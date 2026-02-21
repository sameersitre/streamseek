import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { interactionKeys } from "./queryKeys";
import type { ToggleParams, AllInteractionsResponse } from "@/app/types";

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ToggleParams) => apiClient.toggleLike(params),

    onMutate: async (params) => {
      // Cancel outgoing queries to prevent overwrite
      await queryClient.cancelQueries({ queryKey: interactionKeys.userAll() });

      // Snapshot previous state for rollback
      const previous = queryClient.getQueryData<AllInteractionsResponse>(
        interactionKeys.userAll(),
      );

      // Optimistically update cache
      queryClient.setQueryData<AllInteractionsResponse>(
        interactionKeys.userAll(),
        (old) => {
          if (!old) return { interactions: [{ mediaId: params.mediaId, mediaType: params.mediaType, liked: true, watchlisted: false }] };

          const existing = old.interactions.find(
            (i) => i.mediaId === params.mediaId && i.mediaType === params.mediaType,
          );

          if (existing) {
            return {
              interactions: old.interactions.map((i) =>
                i.mediaId === params.mediaId && i.mediaType === params.mediaType
                  ? { ...i, liked: !i.liked }
                  : i,
              ),
            };
          }

          // New interaction
          return {
            interactions: [
              ...old.interactions,
              { mediaId: params.mediaId, mediaType: params.mediaType, liked: true, watchlisted: false },
            ],
          };
        },
      );

      return { previous };
    },

    onError: (_err, _params, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(interactionKeys.userAll(), context.previous);
      }
    },

    onSettled: () => {
      // Sync with server truth
      queryClient.invalidateQueries({ queryKey: interactionKeys.userAll() });
      // Also invalidate watchlist/likes pages since they show denormalized data
      queryClient.invalidateQueries({ queryKey: interactionKeys.all });
    },
  });
}
