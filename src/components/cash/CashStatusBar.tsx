"use client";

import { Wallet, Loader2, XCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { CashRegister } from "@/hooks/useCashRegister";

interface CashStatusBarProps {
  current: CashRegister | null;
  loading: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function CashStatusBar({ current, loading, onOpen, onClose }: CashStatusBarProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-neutral-50 py-3 dark:bg-neutral-900">
        <Loader2 className="h-5 w-5 animate-spin text-gold" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Wallet className="h-4 w-4" />
          Caja cerrada
        </div>
        <Button variant="ghost" size="sm" onClick={onOpen}>
          <Play className="h-4 w-4" />
          Abrir caja
        </Button>
      </div>
    );
  }

  const ingresos = (current.movements ?? [])
    .filter((m) => m.tipo === "ingreso")
    .reduce((s, m) => s + Number(m.monto), 0);

  const egresos = (current.movements ?? [])
    .filter((m) => m.tipo === "egreso")
    .reduce((s, m) => s + Number(m.monto), 0);

  return (
    <div className="flex items-center justify-between rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 dark:bg-gold/10">
      <div className="flex items-center gap-2 text-sm">
        <Wallet className="h-4 w-4 text-gold" />
        <span className="font-medium text-ink dark:text-white">Caja abierta</span>
        <span className="text-neutral-500">
          S/ {current.montoInicial} inicial · Ingresos {formatCurrency(ingresos)} · Egresos {formatCurrency(egresos)}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={onClose} className="text-red-500 hover:text-red-700">
        <XCircle className="h-4 w-4" />
        Cerrar
      </Button>
    </div>
  );
}
