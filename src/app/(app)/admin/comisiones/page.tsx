"use client";

import { useState, useMemo } from "react";
import { DollarSign, CheckCircle, Loader2, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageShell } from "@/components/ui/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCommissions, type Commission } from "@/hooks/useCommissions";
import { useColaboradores } from "@/hooks/useColaboradores";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ComisionesPage() {
  const { commissions, loading, pendingTotal, pay } = useCommissions();
  const { colaboradores } = useColaboradores();
  const [colaboradorFilter, setColaboradorFilter] = useState<string>("");
  const [payingId, setPayingId] = useState<string | null>(null);

  const filtered = useMemo(
    () => colaboradorFilter ? commissions.filter((c) => c.colaboradorId === colaboradorFilter) : commissions,
    [commissions, colaboradorFilter],
  );

  async function handlePay(id: string) {
    setPayingId(id);
    try {
      await pay(id);
    } catch {
      // error handled by hook
    }
    setPayingId(null);
  }

  const pendientes = filtered.filter((c) => c.status === "pendiente");
  const pagadas = filtered.filter((c) => c.status === "pagada");

  return (
    <PageShell title="Comisiones" loading={loading} empty={false}>
      <Card className="flex items-center gap-4 border-gold/20 bg-gold/5 p-5">
        <DollarSign className="h-8 w-8 shrink-0 text-gold" />
        <div>
          <p className="text-sm text-neutral-500">Total pendiente por pagar</p>
          <p className="text-2xl font-bold text-ink">{formatCurrency(pendingTotal)}</p>
        </div>
      </Card>

      {/* Filter by colaboradora */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <User className="h-4 w-4 shrink-0 text-neutral-400" />
        {[{ id: "", fullName: "Todas" }, ...colaboradores].map((col) => (
          <button
            key={col.id}
            onClick={() => setColaboradorFilter(col.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              colaboradorFilter === col.id
                ? "bg-gold text-white"
                : "border border-neutral-200 bg-white text-neutral-600 hover:border-gold/30"
            }`}
          >
            {col.fullName}
          </button>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-ink">
          Pendientes ({pendientes.length})
        </h2>
        {pendientes.length === 0 ? (
          <EmptyState message="No hay comisiones pendientes" />
        ) : (
          <div className="flex flex-col gap-3">
            {pendientes.map((c) => (
              <CommissionCard key={c.id} commission={c} onPay={handlePay} payingId={payingId} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-ink">
          Pagadas ({pagadas.length})
        </h2>
        {pagadas.length === 0 ? (
          <EmptyState message="No hay comisiones pagadas" />
        ) : (
          <div className="flex flex-col gap-3">
            {pagadas.map((c) => (
              <CommissionCard key={c.id} commission={c} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function CommissionCard({
  commission,
  onPay,
  payingId,
}: {
  commission: Commission;
  onPay?: (id: string) => void;
  payingId?: string | null;
}) {
  const isPending = commission.status === "pendiente";
  const clientName = commission.appointment?.client
    ? `${commission.appointment.client.firstName} ${commission.appointment.client.lastName}`
    : "—";

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold text-ink">
            {commission.colaborador?.fullName ?? "—"}
          </p>
          <p className="text-sm text-neutral-500">{clientName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-gold">
            {formatCurrency(commission.amount)}
          </span>
          <Badge variant={isPending ? "gold" : "success"}>
            {isPending ? "Pendiente" : "Pagada"}
          </Badge>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
        <span className="text-xs text-neutral-400">
          {commission.createdAt ? formatDate(commission.createdAt) : "—"}
          {commission.settledAt && ` · Liquidado: ${formatDate(commission.settledAt)}`}
        </span>
        {isPending && onPay && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onPay(commission.id)}
            disabled={payingId === commission.id}
          >
            {payingId === commission.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Pagar
          </Button>
        )}
      </div>
    </Card>
  );
}
