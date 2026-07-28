"use client";

import { useSession } from "next-auth/react";
import { Loader2, Calendar } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppointmentCard } from "@/components/cards/AppointmentCard";
import { useAppointments } from "@/hooks/useAppointments";

export default function MisCitasPage() {
  const { data: session } = useSession();
  const { appointments, statusLabels, loading, error, update } = useAppointments();
  const colaboradorId = session?.user?.colaboradorId;

  const mine = colaboradorId
    ? appointments.filter((a) => a.colaboradorId === colaboradorId)
    : [];

  return (
    <>
      <TopBar title="Mis Citas" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <Card className="flex items-center gap-3 border-gold/20 bg-gold/5">
          <Calendar className="h-5 w-5 shrink-0 text-gold" />
          <p className="text-sm text-neutral-600">
            Tienes <strong className="text-ink">{mine.length}</strong> citas
          </p>
        </Card>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : error ? (
          <EmptyState message={error} />
        ) : mine.length === 0 ? (
          <Card className="py-8 text-center text-sm text-neutral-400">
            No tienes citas asignadas
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {mine.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                statusLabel={statusLabels[apt.status]}
                onComplete={async () => {
                  await update(apt.id, { status: "completada" });
                }}
                onCancel={async () => {
                  await update(apt.id, { status: "cancelada" });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
