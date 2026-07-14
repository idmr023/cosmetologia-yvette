"use client";

import { useState, useEffect, useCallback } from "react";

export interface Colaborador {
  id: string;
  userId: string | null;
  fullName: string;
  phone: string | null;
  specialty: string | null;
  commissionPct: string | null;
  isAvailable: boolean;
  colorTag: string | null;
}

interface UseColaboradoresReturn {
  colaboradores: Colaborador[];
  loading: boolean;
  error: string | null;
  create: (data: Partial<Colaborador>) => Promise<Colaborador & { email: string; tempPass: string }>;
  update: (id: string, data: Partial<Colaborador>) => Promise<Colaborador>;
  remove: (id: string) => Promise<void>;
}

export function useColaboradores(): UseColaboradoresReturn {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColaboradores = useCallback(async () => {
    try {
      const res = await fetch("/api/colaboradores");
      if (!res.ok) throw new Error("Error al cargar colaboradoras");
      const data = await res.json();
      setColaboradores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColaboradores();
  }, [fetchColaboradores]);

  const create = useCallback(
    async (data: Partial<Colaborador>) => {
      const res = await fetch("/api/colaboradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al crear colaboradora");
      const created = await res.json();
      await fetchColaboradores();
      return created;
    },
    [fetchColaboradores],
  );

  const update = useCallback(
    async (id: string, data: Partial<Colaborador>) => {
      const res = await fetch(`/api/colaboradores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al actualizar colaboradora");
      const updated = await res.json();
      await fetchColaboradores();
      return updated;
    },
    [fetchColaboradores],
  );

  const remove = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/colaboradores/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar colaboradora");
      await fetchColaboradores();
    },
    [fetchColaboradores],
  );

  return { colaboradores, loading, error, create, update, remove };
}
