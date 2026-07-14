"use client";

import { useState } from "react";
import { DollarSign, CheckCircle, Loader2 } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCommissions, type Commission } from "@/hooks/useCommissions";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ComisionesPage() {
  const { commissions, loading, pendingTotal, pay } = useCommissions();
  const [payingId, setPayingId] = useState<string | null>(null);

  async function handlePay(id: string) {
    setPayingId(id);
    try {
      await pay(id);
    } catch {
      // error handled by hook
    }
    setPayingId(null);
  }

  const pendientes = commissions.filter((c) => c.status === "pendiente");
  const pagadas = commissions.filter((c) => c.status === "pagada");

  return (
    <>
      <TopBar title="Comisiones" />

      <div className="mx-auto max-w-2xl space-y-4 p-4 md:max-w-4xl">
        <Card className="flex items-center gap-4 border-gold/20 bg-gold/5 p-5">
          <DollarSign className="h-8 w-8 shrink-0 text-gold" />
          <div>
            <p className="text-sm text-neutral-500">Total pendiente por pagar</p>
            <p className="text-2xl font-bold text-ink">{formatCurrency(pendingTotal)}</p>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (
          <>
            {/* Pendientes */}
            <div>
              <h2 className="mb-3 text-lg font-semibold text-ink">
                Pendientes ({pendientes.length})
              </h2>
              {pendientes.length === 0 ? (
                <Card className="py-6 text-center text-sm text-neutral-400">
                  No hay comisiones pendientes
                </Card>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendientes.map((c) => (
                    <CommissionCard key={c.id} commission={c} onPay={handlePay} payingId={payingId} />
                  ))}
                </div>
              )}
            </div>

            {/* Pagadas */}
            <div>
              <h2 className="mb-3 text-lg font-semibold text-ink">
                Pagadas ({pagadas.length})
              </h2>
              {pagadas.length === 0 ? (
                <Card className="py-6 text-center text-sm text-neutral-400">
                  No hay comisiones pagadas
                </Card>
              ) : (
                <div className="flex flex-col gap-3">
                  {pagadas.map((c) => (
                    <CommissionCard key={c.id} commission={c} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
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
