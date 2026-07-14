"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

export type AppointmentStatus =
  | "pendiente"
  | "confirmada"
  | "completada"
  | "cancelada";

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  services: string[];
  colaboradorName: string;
  startAt: string;
  status: AppointmentStatus;
  totalPrice: string;
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};

interface UseAppointmentsReturn {
  appointments: Appointment[];
  today: Appointment[];
  loading: boolean;
  error: string | null;
  filter: AppointmentStatus | "all";
  setFilter: (v: AppointmentStatus | "all") => void;
  statusLabels: typeof STATUS_LABELS;
  total: number;
  update: (id: string, data: Partial<Appointment>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function useAppointments(): UseAppointmentsReturn {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AppointmentStatus | "all">("all");

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error("Error al cargar citas");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filtered = useMemo(() => {
    if (filter === "all") return appointments;
    return appointments.filter((a) => a.status === filter);
  }, [appointments, filter]);

  const today = useMemo(
    () => appointments.filter((a) => isSameDay(new Date(a.startAt), new Date())),
    [appointments],
  );

  const update = useCallback(
    async (id: string, data: Partial<Appointment>) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al actualizar cita");
      await fetchAppointments();
    },
    [fetchAppointments],
  );

  const remove = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar cita");
      await fetchAppointments();
    },
    [fetchAppointments],
  );

  return {
    appointments: filtered,
    today,
    loading,
    error,
    filter,
    setFilter,
    statusLabels: STATUS_LABELS,
    total: appointments.length,
    update,
    remove,
  };
}
