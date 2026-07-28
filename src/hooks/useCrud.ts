"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useSyncStore } from "@/stores/syncStore";
import { cacheGet, cacheSet } from "@/lib/idbCache";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
}

function unwrap<T>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];
  if (json && typeof json === "object" && "data" in (json as Record<string, unknown>)) {
    return (json as PaginatedResponse<T>).data;
  }
  return [];
}

async function fetcher<T>(endpoint: string): Promise<{ data: T[]; total: number }> {
  const res = await apiFetch(endpoint);
  if (res.status === 503) {
    const cached = await cacheGet<{ data: T[]; total: number }>(endpoint);
    if (cached) return cached;
    throw new Error("Sin conexión");
  }
  if (!res.ok) throw new Error("Error al cargar datos");
  const json = await res.json();
  const items = unwrap<T>(json);
  const total =
    json && typeof json === "object" && "total" in (json as Record<string, unknown>)
      ? (json as PaginatedResponse<T>).total
      : items.length;
  const result = { data: items, total };
  await cacheSet(endpoint, result);
  return result;
}

export function useCrud<T extends { id: string }>(endpoint: string) {
  const queryClient = useQueryClient();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const query = useQuery({
    queryKey: ["crud", endpoint],
    queryFn: () => fetcher<T>(endpoint),
    staleTime: 5 * 60 * 1000,
  });

  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ["crud", endpoint] });
  }, [queryClient, endpoint]);

  const create = useMutation({
    mutationFn: async (body: Record<string, unknown>): Promise<T> => {
      if (!navigator.onLine) {
        const add = useSyncStore.getState().add;
        await add({ endpoint, method: "POST", body });
        throw new Error("Cambio guardado sin conexión. Se sincronizará automáticamente.");
      }
      const res = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error al crear");
      return res.json();
    },
    onSuccess: () => invalidate(),
  });

  const update = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }): Promise<T> => {
      if (!navigator.onLine) {
        const add = useSyncStore.getState().add;
        await add({ endpoint: `${endpoint}/${id}`, method: "PUT", body });
        throw new Error("Cambio guardado sin conexión. Se sincronizará automáticamente.");
      }
      const res = await apiFetch(`${endpoint}/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      return res.json();
    },
    onSuccess: () => invalidate(),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!navigator.onLine) {
        const add = useSyncStore.getState().add;
        await add({ endpoint: `${endpoint}/${id}`, method: "DELETE" });
        throw new Error("Cambio guardado sin conexión. Se sincronizará automáticamente.");
      }
      const res = await apiFetch(`${endpoint}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
    },
    onSuccess: () => invalidate(),
  });

  return {
    data: query.data?.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    total: query.data?.total ?? 0,
    isOffline,
    create: (body: Record<string, unknown>) => create.mutateAsync(body),
    update: (id: string, body: Record<string, unknown>) =>
      update.mutateAsync({ id, body }),
    remove: (id: string) => remove.mutateAsync(id),
    refresh: () => invalidate(),
  };
}
