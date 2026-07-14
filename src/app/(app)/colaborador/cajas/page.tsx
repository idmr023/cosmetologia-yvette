"use client";

import { useState } from "react";
import { Wallet, Loader2, Minus } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sheet, useSheetStore } from "@/components/ui/Sheet";
import { CashStatusBar } from "@/components/cash/CashStatusBar";
import { OpenCashRegister } from "@/components/cash/OpenCashRegister";
import { CloseCashRegister } from "@/components/cash/CloseCashRegister";
import { AddExpense } from "@/components/cash/AddExpense";
import { useCashRegister } from "@/hooks/useCashRegister";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ColCajasPage() {
  const { current, registers, loading, open, close, addExpense } = useCashRegister();
  const sheet = useSheetStore();
  const [saving, setSaving] = useState(false);

  const myRegisters = registers;
  const openRegister = current;

  function handleOpen() {
    sheet.show(
      <OpenCashRegister
        onSave={async (_colaboradorId, montoInicial) => {
          setSaving(true);
          try { await open(_colaboradorId, montoInicial); sheet.close(); } finally { setSaving(false); }
        }}
        onCancel={sheet.close}
        loading={saving}
      />,
    );
  }

  function handleClose() {
    if (!openRegister) return;
    sheet.show(
      <CloseCashRegister
        register={openRegister}
        onSave={async (montoReal, notas) => {
          setSaving(true);
          try { await close(openRegister.id, montoReal, notas); sheet.close(); } finally { setSaving(false); }
        }}
        onCancel={sheet.close}
        loading={saving}
      />,
    );
  }

  function handleAddExpense() {
    if (!openRegister) return;
    sheet.show(
      <AddExpense
        onSave={async (concepto, monto) => {
          setSaving(true);
          try { await addExpense(openRegister.id, concepto, monto); sheet.close(); } finally { setSaving(false); }
        }}
        onCancel={sheet.close}
        loading={saving}
      />,
    );
  }

  return (
    <>
      <TopBar title="Mi Caja" />

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        )}

        {!loading && (
          <>
            <CashStatusBar current={openRegister} loading={false} onOpen={handleOpen} onClose={handleClose} />

            {openRegister && (
              <Button variant="outline" fullWidth size="sm" onClick={handleAddExpense}>
                <Minus className="h-4 w-4" />
                Registrar egreso
              </Button>
            )}

            <h3 className="text-sm font-semibold text-neutral-500">Historial</h3>

            <div className="flex flex-col gap-3">
              {myRegisters.length === 0 && (
                <Card className="py-8 text-center text-sm text-neutral-400">
                  No hay registros de caja
                </Card>
              )}

              {myRegisters.map((r) => {
                const ingresos = (r.movements ?? [])
                  .filter((m) => m.tipo === "ingreso")
                  .reduce((s, m) => s + Number(m.monto), 0);
                const total = Number(r.montoInicial) + ingresos;

                return (
                  <Card key={r.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-gold" />
                        <span className="font-medium text-ink dark:text-white">
                          {formatDate(r.apertura)}
                        </span>
                      </div>
                      <Badge variant={r.estado === "abierta" ? "gold" : "default"}>
                        {r.estado === "abierta" ? "Abierta" : "Cerrada"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-neutral-500">Inicial</span>
                        <p className="font-medium text-ink dark:text-white">{formatCurrency(r.montoInicial)}</p>
                      </div>
                      <div>
                        <span className="text-neutral-500">Total</span>
                        <p className="font-medium text-ink dark:text-white">{formatCurrency(total)}</p>
                      </div>
                      {r.estado === "cerrada" && (
                        <>
                          <div>
                            <span className="text-neutral-500">Real</span>
                            <p className="font-medium text-ink dark:text-white">
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
          </>
        )}
      </div>

      <Sheet />
    </>
  );
}
