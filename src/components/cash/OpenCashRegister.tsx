"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

interface Collaborator {
  id: string;
  fullName: string;
}

interface OpenCashRegisterProps {
  onSave: (colaboradorId: string, montoInicial: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function OpenCashRegister({ onSave, onCancel, loading }: OpenCashRegisterProps) {
  const [colaboradorId, setColaboradorId] = useState("");
  const [montoInicial, setMontoInicial] = useState("0");
  const [colaboradores, setColaboradores] = useState<Collaborator[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/colaboradores")
      .then((r) => r.json())
      .then((data) => {
        setColaboradores(data);
        if (data.length > 0) setColaboradorId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!colaboradorId) return;
    await onSave(colaboradorId, montoInicial);
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
        <h2 className="text-lg font-semibold text-ink dark:text-white">Abrir caja</h2>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink dark:text-white">
            Colaboradora
          </label>
          <select
            value={colaboradorId}
            onChange={(e) => setColaboradorId(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-ink outline-none focus:border-gold dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          >
            {colaboradores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
        </div>

        <Input
          id="montoInicial"
          label="Monto inicial (S/)"
          type="number"
          min="0"
          step="1"
          value={montoInicial}
          onChange={(e) => setMontoInicial(e.target.value)}
        />

        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" fullWidth disabled={loading || !colaboradorId}>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" /> Abrir caja
              </>
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}
