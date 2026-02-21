import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/services/apiClient";
import { interactionKeys } from "./queryKeys";
import type { ToggleParams, AllInteractionsResponse } from "@/app/types";

export function useToggleWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ToggleParams) => apiClient.toggleWatchlist(params),

    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: interactionKeys.userAll() });

      const previous = queryClient.getQueryData<AllInteractionsResponse>(
        interactionKeys.userAll(),
      );

      queryClient.setQueryData<AllInteractionsResponse>(
        interactionKeys.userAll(),
        (old) => {
          if (!old) return { interactions: [{ mediaId: params.mediaId, mediaType: params.mediaType, liked: false, watchlisted: true }] };

          const existing = old.interactions.find(
            (i) => i.mediaId === params.mediaId && i.mediaType === params.mediaType,
          );

          if (existing) {
            return {
              interactions: old.interactions.map((i) =>
                i.mediaId === params.mediaId && i.mediaType === params.mediaType
                  ? { ...i, watchlisted: !i.watchlisted }
                  : i,
              ),
            };
          }

          return {
            interactions: [
              ...old.interactions,
              { mediaId: params.mediaId, mediaType: params.mediaType, liked: false, watchlisted: true },
            ],
          };
        },
      );

      return { previous };
    },

    onError: (_err, _params, context) => {
      if (context?.previous) {
        queryClient.setQueryData(interactionKeys.userAll(), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.userAll() });
      queryClient.invalidateQueries({ queryKey: interactionKeys.all });
    },
  });
}
