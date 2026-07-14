"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Button } from "@/components/ui/Button";
import { Sheet, useSheetStore } from "@/components/ui/Sheet";
import { AppointmentCard } from "@/components/cards/AppointmentCard";
import { AppointmentForm } from "@/components/modals/AppointmentForm";
import { useAppointments, type AppointmentStatus } from "@/hooks/useAppointments";
import { cn } from "@/lib/utils";

const FILTERS: { value: AppointmentStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "confirmada", label: "Confirmadas" },
  { value: "completada", label: "Completadas" },
  { value: "cancelada", label: "Canceladas" },
];

export default function CitasPage() {
  const { appointments, filter, setFilter, statusLabels, loading, update } = useAppointments();
  const sheet = useSheetStore();
  const [saving, setSaving] = useState(false);

  function openNewAppointment() {
    sheet.show(
      <AppointmentForm
        onSave={handleCreate}
        onCancel={sheet.close}
        loading={saving}
      />,
    );
  }

  async function handleCreate(data: { clientId: string; serviceId: string; colaboradorId: string; startAt: string; notes: string }) {
    setSaving(true);
    try {
      const servicesList = await fetch("/api/services").then(r => r.json()).catch(() => []);
      const svc = servicesList.find((s: { id: string }) => s.id === data.serviceId);
      const durationMin = svc?.durationMin ?? 60;
      const start = new Date(data.startAt);
      const end = new Date(start.getTime() + durationMin * 60000);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: data.clientId,
          colaboradorId: data.colaboradorId,
          startAt: start.toISOString(),
          endAt: end.toISOString(),
          notes: data.notes,
          status: "pendiente",
          serviceIds: [data.serviceId],
        }),
      });
      if (res.ok) sheet.close();
    } catch {
      // error handled
    }
    setSaving(false);
  }

  async function handleConfirm(apt: { id: string }) {
    await update(apt.id, { status: "confirmada" } as const);
  }

  async function handleComplete(apt: { id: string }) {
    await update(apt.id, { status: "completada" } as const);
  }

  async function handleCancel(apt: { id: string }) {
    await update(apt.id, { status: "cancelada" } as const);
  }

  return (
    <>
      <TopBar title="Citas" />

      <div className="mx-auto max-w-2xl space-y-4 p-4 md:max-w-4xl">
        <Button fullWidth size="lg" onClick={openNewAppointment}>
          <Plus className="h-5 w-5" />
          Nueva cita
        </Button>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "min-h-touch whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors",
                filter === f.value
                  ? "bg-ink text-white"
                  : "border border-neutral-200 text-neutral-600 hover:border-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white py-8 text-center text-sm text-neutral-400">
            No hay citas en este filtro
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {appointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                statusLabel={statusLabels[apt.status]}
                onConfirm={() => handleConfirm(apt)}
                onComplete={() => handleComplete(apt)}
                onCancel={() => handleCancel(apt)}
              />
            ))}
          </div>
        )}
      </div>

      <Sheet />
    </>
  );
}
