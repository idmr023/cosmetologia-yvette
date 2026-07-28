"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { FilterChips } from "@/components/ui/FilterChips";
import { useSheetStore } from "@/components/ui/Sheet";
import { AppointmentCard } from "@/components/cards/AppointmentCard";
import { AppointmentForm } from "@/components/modals/AppointmentForm";
import { useAppointments, type AppointmentStatus } from "@/hooks/useAppointments";
import { apiFetch } from "@/lib/api";

const FILTERS = [
  { value: "all", label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "confirmada", label: "Confirmadas" },
  { value: "completada", label: "Completadas" },
  { value: "cancelada", label: "Canceladas" },
];

export default function CitasPage() {
  const { appointments, filter, setFilter, statusLabels, loading, refresh, update } = useAppointments();
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

  async function handleCreate(data: { clientId: string; serviceIds: string[]; colaboradorId: string; startAt: string; endAt: string; notes: string }) {
    setSaving(true);
    try {
      const res = await apiFetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: data.clientId,
          colaboradorId: data.colaboradorId,
          startAt: data.startAt,
          endAt: data.endAt,
          notes: data.notes,
          status: "pendiente",
          serviceIds: data.serviceIds,
        }),
      });
      if (res.ok) {
        await refresh();
        sheet.close();
      }
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
      <PageShell
        title="Citas"
        action={{ label: "Nueva cita", icon: Plus, onClick: openNewAppointment }}
        filters={<FilterChips options={FILTERS} value={filter} onChange={(v) => setFilter(v as AppointmentStatus | "all")} />}
        loading={loading}
        empty={appointments.length === 0}
        emptyMessage="No hay citas en este filtro"
      >
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
      </PageShell>

    </>
  );
}
