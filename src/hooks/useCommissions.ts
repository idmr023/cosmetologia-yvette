"use client";

import { useState, useEffect, useCallback } from "react";

export interface Commission {
  id: string;
  appointmentId: string;
  colaboradorId: string;
  amount: string;
  status: "pendiente" | "pagada";
  settledAt: string | null;
  createdAt: string | null;
  appointment: {
    id: string;
    client: { firstName: string; lastName: string } | null;
  } | null;
  colaborador: { fullName: string } | null;
}

interface UseCommissionsReturn {
  commissions: Commission[];
  loading: boolean;
  error: string | null;
  pendingTotal: number;
  pay: (id: string) => Promise<void>;
}

export function useCommissions(): UseCommissionsReturn {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommissions = useCallback(async () => {
    try {
      const res = await fetch("/api/commissions");
      if (!res.ok) throw new Error("Error al cargar comisiones");
      const data = await res.json();
      setCommissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const pendingTotal = commissions
    .filter((c) => c.status === "pendiente")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const pay = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/commissions/${id}`, { method: "PUT" });
      if (!res.ok) throw new Error("Error al pagar comisión");
      await fetchCommissions();
    },
    [fetchCommissions],
  );

  return { commissions, loading, error, pendingTotal, pay };
}
