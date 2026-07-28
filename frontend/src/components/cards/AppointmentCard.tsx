"use client";

import { User, Pencil, Check, X, CalendarCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DataCard } from "@/components/ui/DataCard";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils";
import type { Appointment, AppointmentStatus } from "@/hooks/useAppointments";

const STATUS_VARIANT: Record<AppointmentStatus, "gold" | "success" | "neutral" | "danger"> = {
  pendiente: "gold",
  confirmada: "success",
  completada: "neutral",
  cancelada: "danger",
};

interface AppointmentCardProps {
  appointment: Appointment;
  statusLabel: string;
  onEdit?: (apt: Appointment) => void;
  onConfirm?: (apt: Appointment) => void;
  onComplete?: (apt: Appointment) => void;
  onCancel?: (apt: Appointment) => void;
}

export function AppointmentCard({
  appointment,
  statusLabel,
  onEdit,
  onConfirm,
  onComplete,
  onCancel,
}: AppointmentCardProps) {
  const date = new Date(appointment.startAt);

  return (
    <DataCard
      header={{
        title: appointment.clientName,
        subtitle: `${formatDate(date.toISOString())} · ${formatTime(date.toISOString())}`,
      }}
      headerRight={
        <Badge variant={STATUS_VARIANT[appointment.status]}>{statusLabel}</Badge>
      }
      menu={
        onEdit || onConfirm || onComplete || onCancel
          ? [
              ...(onEdit ? [{ label: "Editar", icon: Pencil, onClick: () => onEdit(appointment) }] : []),
              ...(onConfirm ? [{ label: "Confirmar", icon: Check, onClick: () => onConfirm(appointment) }] : []),
              ...(onComplete ? [{ label: "Completar", icon: CalendarCheck, onClick: () => onComplete(appointment) }] : []),
              ...(onCancel ? [{ label: "Cancelar", icon: X, danger: true as const, onClick: () => onCancel(appointment) }] : []),
            ]
          : undefined
      }
    >
      <div className="flex flex-wrap gap-1.5">
        {appointment.services.map((s) => (
          <span
            key={s}
            className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
        <span className="flex items-center gap-1.5 text-sm text-neutral-500">
          <User className="h-3.5 w-3.5" />
          {appointment.colaboradorName}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gold">
            {formatCurrency(appointment.totalPrice)}
          </span>
        </div>
      </div>
    </DataCard>
  );
}
