"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  channel: string;
  recipientId: string | null;
  title: string | null;
  body: string;
  status: string;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  reminder: "Recordatorio",
  confirmation: "Confirmación",
  promotion: "Promoción",
  low_stock: "Stock bajo",
  review: "Reseña",
};

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? notifications
    : notifications.filter((n) => n.type === filter);

  return (
    <>
      <TopBar title="Notificaciones" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <Card className="flex items-center gap-3 border-gold/20 bg-gold/5">
          <Bell className="h-5 w-5 shrink-0 text-gold" />
          <p className="text-sm text-neutral-600">
            Canal de notificaciones: <strong className="text-ink">Telegram</strong>
          </p>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Todas
          </FilterChip>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <FilterChip key={key} active={filter === key} onClick={() => setFilter(key)}>
              {label}
            </FilterChip>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-8 text-center text-sm text-neutral-400">
            No hay notificaciones registradas
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((n) => (
              <Card key={n.id} className="space-y-2 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {n.status === "sent" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : n.status === "failed" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-neutral-400" />
                    )}
                    <span className="text-sm font-semibold text-ink">
                      {n.title ?? TYPE_LABELS[n.type] ?? n.type}
                    </span>
                  </div>
                  <Badge variant={n.status === "sent" ? "success" : n.status === "failed" ? "danger" : "neutral"}>
                    {n.status}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600">{n.body}</p>
                <p className="text-xs text-neutral-400">
                  {formatDate(n.createdAt)} · {formatTime(n.createdAt)}
                  {n.recipientId && ` · ${n.recipientId}`}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-gold text-white"
          : "border border-neutral-200 bg-white text-neutral-600"
      }`}
    >
      {children}
    </button>
  );
}