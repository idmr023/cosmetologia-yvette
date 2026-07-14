"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";

export default function PerfilPage() {
  const [recargo, setRecargo] = useState("15");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/settings?keys=domicilio_recargo"),
      fetch("/api/settings?keys=horario_atencion"),
    ])
      .then(async ([r1]) => {
        const d1 = await r1.json();
        if (d1.domicilio_recargo) setRecargo(d1.domicilio_recargo);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    const num = Number(recargo);
    if (isNaN(num) || num < 0) {
      setError("El recargo debe ser un número válido");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "domicilio_recargo", value: recargo }),
      });
      if (!res.ok) {
        setError("Error al guardar");
        setSaving(false);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Error de conexión");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <>
        <TopBar title="Perfil" />
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Perfil" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <Card className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-2xl font-semibold text-gold">
            Y
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink dark:text-white">Yvette Roa</h2>
            <p className="text-sm text-neutral-500">Administradora</p>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-ink dark:text-white">Ajustes del negocio</h2>
            <p className="text-sm text-neutral-500">
              Configura el recargo que se añade cuando un cliente elige domicilio
              al reservar una cita.
            </p>
          </div>

          <Input
            id="recargo"
            label="Recargo por domicilio (S/)"
            type="number"
            min="0"
            step="1"
            value={recargo}
            onChange={(e) => setRecargo(e.target.value)}
          />

          <div className="rounded-xl bg-pastel/30 px-4 py-3 text-sm text-neutral-600">
            {Number(recargo) === 0 ? (
              <>Domicilio sin recargo adicional (gratis)</>
            ) : (
              <>Precio actual con domicilio: <strong className="text-gold">{formatCurrency(recargo)}</strong> adicional al servicio</>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Configuración guardada
            </div>
          )}

          <Button onClick={handleSave} size="lg" fullWidth disabled={saving}>
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" /> Guardar
              </>
            )}
          </Button>
        </Card>
      </div>
    </>
  );
}
