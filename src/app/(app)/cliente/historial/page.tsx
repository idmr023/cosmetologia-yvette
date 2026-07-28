"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Scissors, Calendar, Clock } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { InfoCard } from "@/components/ui/InfoCard";
import { formatDate, formatTime } from "@/lib/utils";

interface HistoryItem {
  id: string;
  appointmentId: string | null;
  serviceName: string;
  serviceCategory: string;
  appointmentDate: string | null;
  appointmentStatus: string | null;
  performedAt: string;
}

const STATUS_VARIANT: Record<string, "gold" | "success" | "neutral" | "danger"> = {
  pendiente: "gold",
  confirmada: "success",
  completada: "neutral",
  cancelada: "danger",
};

export default function ClienteHistorialPage() {
  const { data: session } = useSession();
  const clientId = session?.user?.clientId;
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    fetch(`/api/clients/${clientId}/history`)
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clientId]);

  return (
    <>
      <TopBar title="Mi Historial" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <InfoCard icon={Scissors}>
          <p className="text-sm text-neutral-600">
            Tienes <strong className="text-ink">{history.length}</strong> servicios
            registrados en tu historial
          </p>
        </InfoCard>

        {loading ? (
          <LoadingSpinner />
        ) : history.length === 0 ? (
          <EmptyState message="No tienes servicios registrados aún" />
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((item) => (
              <Card key={item.id} className="space-y-2 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm font-semibold text-ink">
                      {item.serviceName}
                    </span>
                  </div>
                  {item.appointmentStatus && (
                    <Badge variant={STATUS_VARIANT[item.appointmentStatus] ?? "neutral"}>
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
