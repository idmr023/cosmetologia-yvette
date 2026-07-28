"use client";

import { useCrud } from "@/hooks/useCrud";
import { apiFetch } from "@/lib/api";
import { useMemo } from "react";

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
  const crud = useCrud<Commission>("/api/commissions");

  const pendingTotal = useMemo(
    () => crud.data.filter((c) => c.status === "pendiente").reduce((sum, c) => sum + Number(c.amount), 0),
    [crud.data],
  );

  const pay = async (id: string) => {
    const res = await apiFetch(`/api/commissions/${id}`, { method: "PUT" });
    if (!res.ok) throw new Error("Error al pagar comisión");
    await crud.refresh();
  };

  return {
    commissions: crud.data,
    loading: crud.loading,
    error: crud.error,
    pendingTotal,
    pay,
  };
}
