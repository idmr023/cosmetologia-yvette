"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { InfoCard } from "@/components/ui/InfoCard";
import { AppointmentCard } from "@/components/cards/AppointmentCard";
import { apiFetch } from "@/lib/api";
import type { Appointment, AppointmentStatus } from "@/hooks/useAppointments";

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};

interface RawAppointment {
  id: string;
  startAt: string;
  status: string;
  totalPrice: string;
  notes: string | null;
  colaboradorId: string;
  colaborador: { fullName: string };
  services: { service: { name: string; category: string } }[];
  client: { firstName: string; lastName: string; phone: string };
}

function mapAppointment(raw: RawAppointment): Appointment {
  return {
    id: raw.id,
    clientName: `${raw.client.firstName} ${raw.client.lastName}`,
    clientPhone: raw.client.phone,
    services: raw.services.map((s) => s.service.name),
    colaboradorId: raw.colaboradorId,
    colaboradorName: raw.colaborador.fullName,
    startAt: raw.startAt,
    status: raw.status as AppointmentStatus,
    totalPrice: raw.totalPrice,
  };
}

export default function ClienteCitasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch("/api/appointments/mine")
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(r.status === 401 ? "Tu sesión venció. Vuelve a ingresar." : "No pudimos cargar tus citas.");
        }
        return r.json();
      })
      .then((data) =>
        setAppointments((data.data ?? []).map(mapAppointment))
      )
      .catch((loadError: Error) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    const timer = window.setInterval(loadAppointments, 20_000);
    return () => window.clearInterval(timer);
  }, [loadAppointments]);

  return (
    <>
      <TopBar title="Mis Citas" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <InfoCard
          icon={Calendar}
          action={
            <Link href="/reservar">
              <Button variant="secondary" size="sm">
                <Plus className="h-4 w-4" />
                Reservar
              </Button>
            </Link>
          }
        >
          <p className="text-sm text-neutral-600">
            Tienes <strong className="text-ink">{appointments.length}</strong>{" "}
            citas en total
          </p>
        </InfoCard>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <EmptyState message={error} />
        ) : appointments.length === 0 ? (
          <EmptyState message="No tienes citas registradas" />
        ) : (
          <div className="flex flex-col gap-3">
            {appointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                statusLabel={STATUS_LABELS[apt.status] ?? apt.status}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
