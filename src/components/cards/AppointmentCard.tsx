"use client";

import { Clock, User, Pencil, Check, X, CalendarCheck, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThreeDotMenu } from "@/components/ui/ThreeDotMenu";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils";
import { waLink, statusChangeMessage } from "@/lib/whatsapp";
import type { Appointment, AppointmentStatus } from "@/hooks/useAppointments";

const STATUS_VARIANT: Record<
  AppointmentStatus,
  "gold" | "success" | "neutral" | "danger"
> = {
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
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold text-ink">
            {appointment.clientName}
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-neutral-500">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(date.toISOString())} · {formatTime(date.toISOString())}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant={STATUS_VARIANT[appointment.status]}>
            {statusLabel}
          </Badge>
          <ThreeDotMenu
            items={[
              { label: "Editar", icon: Pencil, onClick: () => onEdit?.(appointment) },
              {
                label: "Confirmar",
                icon: Check,
                onClick: () => onConfirm?.(appointment),
              },
              {
                label: "Completar",
                icon: CalendarCheck,
                onClick: () => onComplete?.(appointment),
              },
              {
                label: "Cancelar",
                icon: X,
                danger: true,
                onClick: () => onCancel?.(appointment),
              },
            ]}
          />
        </div>
      </div>

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
          <a
            href={waLink(appointment.clientPhone, statusChangeMessage({
              clientName: appointment.clientName,
              serviceName: appointment.services[0] ?? "",
              status: statusLabel,
            }))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-neutral-400 transition-colors hover:text-green-600"
            title="Enviar WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <span className="text-sm font-semibold text-gold">
            {formatCurrency(appointment.totalPrice)}
          </span>
        </div>
      </div>
    </Card>
  );
}
