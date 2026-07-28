"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

interface AddExpenseProps {
  onSave: (concepto: string, monto: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function AddExpense({ onSave, onCancel, loading }: AddExpenseProps) {
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!concepto || !monto) return;
    await onSave(concepto, monto);
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <Card className="space-y-4 p-4">
        <h2 className="text-lg font-semibold text-ink dark:text-white">Registrar egreso</h2>

        <Input
          id="concepto"
          label="Concepto"
          placeholder="Ej: Compra de tintes"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
        />

        <Input
          id="monto"
          label="Monto (S/)"
          type="number"
          min="0"
          step="0.5"
          placeholder="0.00"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />

        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" fullWidth disabled={loading || !concepto || !monto}>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" /> Registrar
              </>
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}
