"use client";

import { Clock, Scissors, Loader2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/utils";
import { useClientHistory, type ClientHistoryItem } from "@/hooks/useClientHistory";

interface ClientHistoryModalProps {
  clientId: string;
  clientName: string;
}

export function ClientHistoryModal({ clientId, clientName }: ClientHistoryModalProps) {
  const { history, loading } = useClientHistory(clientId);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-ink">
        Historial de {clientName}
      </h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 py-8 text-center text-sm text-neutral-400">
          Este cliente no tiene servicios registrados aún
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((item) => (
            <HistoryItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryItemCard({ item }: { item: ClientHistoryItem }) {
  const statusVariant: Record<string, "gold" | "success" | "neutral" | "danger"> = {
    pendiente: "gold",
    confirmada: "success",
    completada: "neutral",
    cancelada: "danger",
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-semibold text-ink">{item.serviceName}</span>
        </div>
        {item.appointmentStatus && (
          <Badge variant={statusVariant[item.appointmentStatus] ?? "neutral"}>
            {item.appointmentStatus}
          </Badge>
        )}
      </div>
      <p className="text-xs text-neutral-500">{item.serviceCategory}</p>
      {item.appointmentDate && (
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(item.appointmentDate)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(item.appointmentDate)}
          </span>
        </div>
      )}
    </div>
  );
}
