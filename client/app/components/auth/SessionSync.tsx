"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/app/stores/useAppStore";

export default function SessionSync() {
  const { data: session, status } = useSession();
  const setUserProfile = useAppStore((s) => s.setUserProfile);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const user = session.user as Record<string, unknown>;
      setUserProfile({
        uid: (user.id as string) ?? "",
        displayName: (user.name as string) ?? null,
        email: (user.email as string) ?? null,
        photoURL: (user.image as string) ?? null,
        provider: (user.provider as string) ?? "",
      });
    } else if (status === "unauthenticated") {
      setUserProfile(null);
    }
  }, [session, status, setUserProfile]);

  return null;
}
