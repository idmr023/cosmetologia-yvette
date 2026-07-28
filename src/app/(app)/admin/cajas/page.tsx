"use client";

import { useState } from "react";
import { Wallet, Minus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/ui/PageShell";
import { FilterChips } from "@/components/ui/FilterChips";
import { useSheetStore } from "@/components/ui/Sheet";
import { CashStatusBar } from "@/components/cash/CashStatusBar";
import { OpenCashRegister } from "@/components/cash/OpenCashRegister";
import { CloseCashRegister } from "@/components/cash/CloseCashRegister";
import { AddExpense } from "@/components/cash/AddExpense";
import { useCashRegister } from "@/hooks/useCashRegister";
import { formatCurrency, formatDate } from "@/lib/utils";

const FILTERS = [
  { value: "todas" as const, label: "Todas" },
  { value: "abierta" as const, label: "Abiertas" },
  { value: "cerrada" as const, label: "Cerradas" },
];

export default function CajasPage() {
  const { current, registers, loading, open, close, addExpense } = useCashRegister();
  const sheet = useSheetStore();
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"todas" | "abierta" | "cerrada">("todas");

  const filtered = registers.filter((r) => {
    if (filter === "abierta") return r.estado === "abierta";
    if (filter === "cerrada") return r.estado === "cerrada";
    return true;
  });

  function handleOpen() {
    sheet.show(
      <OpenCashRegister
        onSave={async (colaboradorId, montoInicial) => {
          setSaving(true);
          try { await open(colaboradorId, montoInicial); sheet.close(); } finally { setSaving(false); }
        }}
        onCancel={sheet.close}
        loading={saving}
      />,
    );
  }

  function handleClose() {
    if (!current) return;
    sheet.show(
      <CloseCashRegister
        register={current}
        onSave={async (montoReal, notas) => {
          setSaving(true);
          try { await close(current.id, montoReal, notas); sheet.close(); } finally { setSaving(false); }
        }}
        onCancel={sheet.close}
        loading={saving}
      />,
    );
  }

  function handleAddExpense() {
    if (!current) return;
    sheet.show(
      <AddExpense
        onSave={async (concepto, monto) => {
          setSaving(true);
          try { await addExpense(current.id, concepto, monto); sheet.close(); } finally { setSaving(false); }
        }}
        onCancel={sheet.close}
        loading={saving}
      />,
    );
  }

  return (
    <>
      <PageShell
        title="Cajas"
        loading={loading}
        empty={false}
      >
        <CashStatusBar current={current} loading={false} onOpen={handleOpen} onClose={handleClose} />

        {current && (
          <Button variant="outline" fullWidth size="sm" onClick={handleAddExpense}>
            <Minus className="h-4 w-4" />
            Registrar egreso
          </Button>
        )}

        <FilterChips options={FILTERS} value={filter} onChange={(v) => setFilter(v as "todas" | "abierta" | "cerrada")} />

        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <Card className="py-8 text-center text-sm text-neutral-400">
              No hay registros de caja
            </Card>
          )}

          {filtered.map((r) => {
            const ingresos = (r.movements ?? [])
              .filter((m) => m.tipo === "ingreso")
              .reduce((s, m) => s + Number(m.monto), 0);
            const total = Number(r.montoInicial) + ingresos;

            return (
              <Card key={r.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-gold" />
                    <span className="font-medium text-ink">
                      {formatDate(r.apertura)}
                    </span>
                  </div>
                  <Badge variant={r.estado === "abierta" ? "gold" : "default"}>
                    {r.estado === "abierta" ? "Abierta" : "Cerrada"}
                  </Badge>
                </div>

                {r.colaborador && (
                  <p className="text-sm text-neutral-500">{r.colaborador.fullName}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-neutral-500">Inicial</span>
                    <p className="font-medium text-ink">{formatCurrency(r.montoInicial)}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Total</span>
                    <p className="font-medium text-ink">{formatCurrency(total)}</p>
                  </div>
                  {r.estado === "cerrada" && (
                    <>
                      <div>
                        <span className="text-neutral-500">Real</span>
                        <p className="font-medium text-ink">
                          {r.montoReal ? formatCurrency(r.montoReal) : "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-500">Diferencia</span>
                        <p className={`font-medium ${
                          Number(r.diferencia ?? 0) === 0
                            ? "text-green-600"
                            : Number(r.diferencia ?? 0) > 0
                              ? "text-green-600"
                              : "text-red-600"
                        }`}>
                          {r.diferencia ? formatCurrency(r.diferencia) : "-"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </PageShell>

    </>
  );
}
