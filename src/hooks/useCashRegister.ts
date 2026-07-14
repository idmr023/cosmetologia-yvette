"use client";

import { useState, useEffect, useCallback } from "react";

export interface CashRegister {
  id: string;
  colaboradorId: string;
  colaborador?: { id: string; fullName: string };
  apertura: string;
  cierre: string | null;
  montoInicial: string;
  montoEsperado: string | null;
  montoReal: string | null;
  diferencia: string | null;
  estado: string;
  notas: string | null;
  movements?: CashMovement[];
}

export interface CashMovement {
  id: string;
  cajaId: string;
  appointmentId: string | null;
  tipo: "ingreso" | "egreso";
  monto: string;
  concepto: string | null;
  createdAt: string;
  appointment?: { id: string; client: { firstName: string; lastName: string } } | null;
}

interface UseCashRegisterReturn {
  current: CashRegister | null;
  registers: CashRegister[];
  loading: boolean;
  error: string | null;
  open: (colaboradorId: string, montoInicial: string) => Promise<void>;
  close: (id: string, montoReal: string, notas?: string) => Promise<void>;
  movements: (id: string) => Promise<CashMovement[]>;
  addExpense: (id: string, concepto: string, monto: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCashRegister(): UseCashRegisterReturn {
  const [current, setCurrent] = useState<CashRegister | null>(null);
  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Get open register for today
      const [currentRes, allRes] = await Promise.all([
        fetch("/api/cash-registers?estado=abierta"),
        fetch("/api/cash-registers"),
      ]);

      if (currentRes.ok) {
        const data: CashRegister[] = await currentRes.json();
        setCurrent(data[0] ?? null);
      }
      if (allRes.ok) {
        const data: CashRegister[] = await allRes.json();
        setRegisters(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const open = useCallback(
    async (colaboradorId: string, montoInicial: string) => {
      const res = await fetch("/api/cash-registers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colaboradorId, montoInicial }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Error al abrir caja");
      }
      await fetchAll();
    },
    [fetchAll],
  );

  const close = useCallback(
    async (id: string, montoReal: string, notas?: string) => {
      const res = await fetch(`/api/cash-registers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montoReal, notas }),
      });
      if (!res.ok) throw new Error("Error al cerrar caja");
      await fetchAll();
    },
    [fetchAll],
  );

  const movements = useCallback(async (id: string) => {
    const res = await fetch(`/api/cash-registers/${id}/movements`);
    if (!res.ok) throw new Error("Error al cargar movimientos");
    return res.json();
  }, []);

  const addExpense = useCallback(
    async (id: string, concepto: string, monto: string) => {
      const res = await fetch(`/api/cash-registers/${id}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "egreso", concepto, monto }),
      });
      if (!res.ok) throw new Error("Error al registrar egreso");
      await fetchAll();
    },
    [fetchAll],
  );

  return {
    current,
    registers,
    loading,
    error,
    open,
    close,
    movements,
    addExpense,
    refresh: fetchAll,
  };
}
