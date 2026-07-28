"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/stores/authStore";

export function AuthTokenSync() {
  const { data: session, status } = useSession();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
  const setRole = useAuthStore((state) => state.setRole);
  const reset = useAuthStore((state) => state.reset);

  useEffect(() => {
    if (status === "unauthenticated") {
      reset();
    }
    if (status === "authenticated") {
      setAccessToken(session.accessToken ?? null);
      setRefreshToken(session.refreshToken ?? null);
      setRole(session.user.role ?? "cliente");
    }
  }, [reset, session, setAccessToken, setRefreshToken, setRole, status]);

  return null;
}
