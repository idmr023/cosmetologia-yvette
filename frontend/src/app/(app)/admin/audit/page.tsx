"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/utils";

interface AuditEntry {
  id: string;
  userId: string | null;
  action: string;
  email: string | null;
  ip: string | null;
  userAgent: string | null;
  success: boolean;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: "Login exitoso",
  LOGIN_PASSWORD_FAIL: "Contraseña incorrecta",
  LOGIN_USER_NOT_FOUND: "Usuario no encontrado",
  LOGIN_LOCKED: "Cuenta bloqueada",
  LOGIN_RATE_BLOCKED: "Rate limit bloqueado",
  TURNSTILE_FAILED: "Turnstile fallido",
  REGISTER: "Registro",
  PASSWORD_RECOVERY: "Recuperación de contraseña",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((data) => setLogs(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? logs
    : logs.filter((l) => l.action === filter);

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <>
      <TopBar title="Audit Logs" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <Card className="flex items-center gap-3 border-gold/20 bg-gold/5">
          <ShieldAlert className="h-5 w-5 shrink-0 text-gold" />
          <p className="text-sm text-neutral-600">
            Registro de eventos de seguridad y autenticación
          </p>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Todos
          </FilterChip>
          {uniqueActions.map((action) => (
            <FilterChip key={action} active={filter === action} onClick={() => setFilter(action)}>
              {ACTION_LABELS[action] ?? action}
            </FilterChip>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-8 text-center text-sm text-neutral-400">
            No hay registros de auditoría
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((log) => (
              <Card key={log.id} className="space-y-2 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {log.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-semibold text-ink">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </div>
                  <Badge variant={log.success ? "success" : "danger"}>
                    {log.success ? "Éxito" : "Fallido"}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1 text-xs text-neutral-400">
                  {log.email && <span>Usuario: {log.email}</span>}
                  {log.ip && <span>IP: {log.ip}</span>}
                  <span>
                    {formatDate(log.createdAt)} · {formatTime(log.createdAt)}
                  </span>
                </div>
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