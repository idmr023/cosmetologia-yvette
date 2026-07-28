import { useAuthStore } from "@/stores/authStore";
import { getSession } from "next-auth/react";

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}> = [];

async function refreshToken(): Promise<string> {
  const refreshTokenValue = useAuthStore.getState().refreshToken;
  if (!refreshTokenValue) throw new Error("No refresh token");

  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });

  if (!res.ok) {
    useAuthStore.getState().reset();
    throw new Error("Refresh failed");
  }

  const data = await res.json();
  useAuthStore.getState().setAccessToken(data.token);
  if (data.refreshToken) {
    useAuthStore.getState().setRefreshToken(data.refreshToken);
  }
  return data.token;
}

function processQueue(error: Error | null, token: string | null) {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error);
    else if (token) p.resolve(token);
  });
  pendingQueue = [];
}

export async function apiFetch(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  let token = useAuthStore.getState().accessToken;
  if (!token) {
    const session = await getSession();
    token = session?.accessToken ?? null;
    if (token) {
      useAuthStore.getState().setAccessToken(token);
      useAuthStore.getState().setRefreshToken(session?.refreshToken ?? null);
      useAuthStore.getState().setRole(session?.user?.role ?? "cliente");
    }
  }
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (init?.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let res = await fetch(input, { ...init, headers });

  // 401 → try refresh
  if (res.status === 401 && useAuthStore.getState().refreshToken) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshToken();
        isRefreshing = false;
        processQueue(null, newToken);
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(input, { ...init, headers });
      } catch (err) {
        isRefreshing = false;
        processQueue(err as Error, null);
        useAuthStore.getState().reset();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw err;
      }
    } else {
      // Another refresh is in flight — queue this request
      const token = await new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      });
      headers["Authorization"] = `Bearer ${token}`;
      res = await fetch(input, { ...init, headers });
    }
  }

  return res;
}
