"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { unwrapResponse } from "@/lib/utils";

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
  colaboradorId: string;
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
  refresh: () => Promise<unknown>;
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

function filterByStatus(
  appointments: Appointment[],
  filter: AppointmentStatus | "all",
): Appointment[] {
  if (filter === "all") return appointments;
  return appointments.filter((a) => a.status === filter);
}

export function useAppointments(): UseAppointmentsReturn {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<AppointmentStatus | "all">("all");

  const query = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const res = await apiFetch("/api/appointments");
      if (!res.ok) {
        throw new Error(res.status === 401 ? "Tu sesión venció. Vuelve a ingresar." : "Error al cargar citas");
      }
      const json = await res.json();
      const raw = unwrapResponse<Record<string, unknown> & { services: { service: { name: string } }[] }>(json);
      return raw.map((apt) => ({
        ...apt,
        services: apt.services?.map((s) => s.service.name) ?? [],
      })) as Appointment[];
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 20_000,
  });

  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ["appointments"] });
  }, [queryClient]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Appointment> }) => {
      const res = await apiFetch(`/api/appointments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al actualizar cita");
    },
    onSuccess: () => invalidate(),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar cita");
    },
    onSuccess: () => invalidate(),
  });

  const all = query.data ?? [];
  const filtered = filterByStatus(all, filter);
  const today = all.filter((a) => isSameDay(new Date(a.startAt), new Date()));

  return {
    appointments: filtered,
    today,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    filter,
    setFilter,
    statusLabels: STATUS_LABELS,
    total: all.length,
    refresh: () => query.refetch(),
    update: async (id, data) => updateMutation.mutateAsync({ id, data }),
    remove: async (id) => removeMutation.mutateAsync(id),
  };
}
