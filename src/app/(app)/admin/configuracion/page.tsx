"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Building2, Clock, DollarSign, Gift } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Settings {
  biz_nombre: string;
  biz_direccion: string;
  biz_telefono: string;
  biz_ruc: string;
  horario_lunes_viernes: string;
  horario_sabado: string;
  domicilio_recargo: string;
  loyalty_points_per_sol: string;
  loyalty_birthday_bonus: string;
  loyalty_referral_bonus: string;
}

const DEFAULTS: Settings = {
  biz_nombre: "Centro de Estética Yvette",
  biz_direccion: "Cercado de Lima",
  biz_telefono: "991697726",
  biz_ruc: "10107822564",
  horario_lunes_viernes: "09:00 - 19:00",
  horario_sabado: "09:00 - 17:00",
  domicilio_recargo: "0",
  loyalty_points_per_sol: "1",
  loyalty_birthday_bonus: "50",
  loyalty_referral_bonus: "100",
};

export default function ConfiguracionPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const keys = Object.keys(DEFAULTS).join(",");
    fetch(`/api/settings?keys=${keys}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const map: Record<string, string> = {};
          data.forEach((s: { key: string; value: string }) => { map[s.key] = s.value; });
          setSettings((prev) => ({ ...prev, ...map }));
        } else if (typeof data === "object") {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function update(key: keyof Settings, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const entries = Object.entries(settings).filter(([, v]) => v.trim() !== "");
      await Promise.all(
        entries.map(([key, value]) =>
          fetch("/api/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, value }),
          }),
        ),
      );
      setMessage("Configuración guardada correctamente.");
    } catch {
      setMessage("Error al guardar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <>
      <TopBar title="Configuración" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Datos del negocio */}
        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gold" />
            <h3 className="font-semibold text-ink">Datos del Negocio</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Nombre</label>
              <Input value={settings.biz_nombre} onChange={(e) => update("biz_nombre", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Dirección</label>
              <Input value={settings.biz_direccion} onChange={(e) => update("biz_direccion", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Teléfono</label>
                <Input value={settings.biz_telefono} onChange={(e) => update("biz_telefono", e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">RUC</label>
                <Input value={settings.biz_ruc} onChange={(e) => update("biz_ruc", e.target.value)} />
              </div>
            </div>
          </div>
        </Card>

        {/* Horario */}
        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gold" />
            <h3 className="font-semibold text-ink">Horario de Atención</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Lunes a Viernes</label>
              <Input value={settings.horario_lunes_viernes} onChange={(e) => update("horario_lunes_viernes", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Sábado</label>
              <Input value={settings.horario_sabado} onChange={(e) => update("horario_sabado", e.target.value)} />
            </div>
          </div>
        </Card>

        {/* Domicilio */}
        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gold" />
            <h3 className="font-semibold text-ink">Domicilio</h3>
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Recargo por domicilio (S/)</label>
            <Input
              type="number"
              min="0"
              step="0.50"
              value={settings.domicilio_recargo}
              onChange={(e) => update("domicilio_recargo", e.target.value)}
            />
            {Number(settings.domicilio_recargo) > 0 && (
              <p className="mt-1 text-xs text-neutral-400">
                S/ {settings.domicilio_recargo} adicional al servicio
              </p>
            )}
          </div>
        </Card>

        {/* Fidelización */}
        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-gold" />
            <h3 className="font-semibold text-ink">Fidelización</h3>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Pts por S/</label>
                <Input type="number" min="0" value={settings.loyalty_points_per_sol} onChange={(e) => update("loyalty_points_per_sol", e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Bono cumpleaños</label>
                <Input type="number" min="0" value={settings.loyalty_birthday_bonus} onChange={(e) => update("loyalty_birthday_bonus", e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Bono referral</label>
                <Input type="number" min="0" value={settings.loyalty_referral_bonus} onChange={(e) => update("loyalty_referral_bonus", e.target.value)} />
              </div>
            </div>
          </div>
        </Card>

        {message && (
          <p className={`text-sm ${message.includes("correctamente") ? "text-green-600" : "text-red-500"}`}>
            {message}
          </p>
        )}

        <Button onClick={handleSave} disabled={saving} fullWidth>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Configuración
        </Button>
      </div>
    </>
  );
}
