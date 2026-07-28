"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import type { CashRegister, CashMovement } from "@/hooks/useCashRegister";

interface CloseCashRegisterProps {
  register: CashRegister;
  onSave: (montoReal: string, notas?: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function CloseCashRegister({ register, onSave, onCancel, loading }: CloseCashRegisterProps) {
  const [montoReal, setMontoReal] = useState("");
  const [notas, setNotas] = useState("");
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`/api/cash-registers/${register.id}/movements`)
      .then((r) => r.json())
      .then((data: CashMovement[]) => {
        setMovements(data);
        const ingresos = data.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + Number(m.monto), 0);
        const egresos = data.filter((m) => m.tipo === "egreso").reduce((s, m) => s + Number(m.monto), 0);
        const esperado = Number(register.montoInicial) + ingresos - egresos;
        setMontoReal(esperado.toFixed(2));
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [register.id, register.montoInicial]);

  const ingresos = movements.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + Number(m.monto), 0);
  const egresos = movements.filter((m) => m.tipo === "egreso").reduce((s, m) => s + Number(m.monto), 0);
  const esperado = Number(register.montoInicial) + ingresos - egresos;
  const diff = Number(montoReal) - esperado;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(montoReal, notas || undefined);
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <Card className="space-y-4 p-4">
        <h2 className="text-lg font-semibold text-ink dark:text-white">Cerrar caja</h2>

        <div className="space-y-2 rounded-xl bg-pastel/30 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Monto inicial</span>
            <span className="font-medium text-ink dark:text-white">{formatCurrency(register.montoInicial)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Ingresos</span>
            <span className="font-medium text-green-600">{formatCurrency(ingresos)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Egresos</span>
            <span className="font-medium text-red-600">{formatCurrency(egresos)}</span>
          </div>
          <hr className="border-neutral-300 dark:border-neutral-700" />
          <div className="flex justify-between">
            <span className="font-medium text-ink dark:text-white">Esperado</span>
            <span className="font-bold text-ink dark:text-white">{formatCurrency(esperado)}</span>
          </div>
        </div>

        <Input
          id="montoReal"
          label="Monto real en caja (S/)"
          type="number"
          min="0"
          step="0.01"
          value={montoReal}
          onChange={(e) => setMontoReal(e.target.value)}
        />

        {diff !== 0 && (
          <div className={`rounded-xl px-4 py-3 text-sm ${diff > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            {diff > 0 ? "Sobra " : "Falta "}
            <strong>{formatCurrency(Math.abs(diff))}</strong>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-ink dark:text-white">
            Notas (opcional)
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-ink outline-none focus:border-gold dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            placeholder="Motivo de diferencia, observaciones..."
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" /> Cerrar caja
              </>
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}
