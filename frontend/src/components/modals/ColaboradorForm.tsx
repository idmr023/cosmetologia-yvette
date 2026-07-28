"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
interface ColaboradorFormProps {
  initial?: {
    fullName: string;
    phone: string;
    specialty: string;
    commissionPct: string;
    isAvailable: boolean;
    colorTag: string;
  };
  createdCredentials?: { email: string; tempPass: string } | null;
  onSave: (data: {
    fullName: string;
    phone: string;
    specialty: string;
    commissionPct: string;
    isAvailable: boolean;
    colorTag: string;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const COLORS = ["#C9A227", "#E74C3C", "#3498DB", "#2ECC71", "#9B59B6", "#E67E22", "#1ABC9C", "#34495E"];

export function ColaboradorForm({ initial, createdCredentials, onSave, onCancel, loading }: ColaboradorFormProps) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [specialty, setSpecialty] = useState(initial?.specialty ?? "");
  const [commissionPct, setCommissionPct] = useState(initial?.commissionPct ?? "0");
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [colorTag, setColorTag] = useState(initial?.colorTag ?? COLORS[0]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return;
    await onSave({
      fullName: fullName.trim(),
      phone: phone.trim(),
      specialty: specialty.trim(),
      commissionPct,
      isAvailable,
      colorTag,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-ink">
        {initial ? "Editar colaboradora" : "Nueva colaboradora"}
      </h2>

      {createdCredentials && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm">
          <p className="mb-2 font-medium text-ink">Colaboradora creada</p>
          <p className="text-neutral-600">Email: <strong>{createdCredentials.email}</strong></p>
          <p className="text-neutral-600">Contraseña: <strong>{createdCredentials.tempPass}</strong></p>
          <p className="mt-1 text-xs text-neutral-400">La colaboradora puede cambiar su contraseña al iniciar sesión.</p>
        </div>
      )}

      <Input
        id="col-name"
        label="Nombre completo"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Nombre y apellido"
        required
      />

      <Input
        id="col-phone"
        label="Teléfono"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="987654321"
      />

      <Input
        id="col-specialty"
        label="Especialidad"
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
        placeholder="Ej: Peluquería y Color"
      />

      <Input
        id="col-commission"
        label="Comisión (%)"
        type="number"
        min="0"
        max="100"
        step="1"
        value={commissionPct}
        onChange={(e) => setCommissionPct(e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Color de avatar</label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColorTag(c)}
              className={`h-8 w-8 rounded-full transition-transform ${
                colorTag === c ? "scale-110 ring-2 ring-ink ring-offset-2" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <label className="flex min-h-touch items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
        <input
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="h-5 w-5 rounded border-neutral-300 text-gold focus:ring-gold"
        />
        <span className="text-sm text-neutral-700">Disponible para citas</span>
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="button" onClick={onCancel} variant="outline" fullWidth disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" fullWidth disabled={loading || !fullName.trim()}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {initial ? "Guardar cambios" : "Crear colaboradora"}
        </Button>
      </div>
    </form>
  );
}
