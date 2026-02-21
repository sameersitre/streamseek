import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiClient } from "@/app/services/apiClient";
import { interactionKeys } from "./queryKeys";

export function useUserLikes(page: number = 1) {
  const { status } = useSession();

  return useQuery({
    queryKey: interactionKeys.likes(page),
    queryFn: () => apiClient.likes({ page }),
    enabled: status === "authenticated",
  });
}
