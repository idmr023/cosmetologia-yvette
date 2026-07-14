"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ClientFormProps {
  initial?: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    notes: string;
  };
  onSave: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    notes: string;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ClientForm({ initial, onSave, onCancel, loading }: ClientFormProps) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) return;
    await onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-ink">
        {initial ? "Editar cliente" : "Nuevo cliente"}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="c-firstName"
          label="Nombre"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Nombre"
          required
        />
        <Input
          id="c-lastName"
          label="Apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Apellido"
          required
        />
      </div>

      <Input
        id="c-phone"
        label="Teléfono / WhatsApp"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="987654321"
        required
      />

      <Input
        id="c-email"
        label="Email (opcional)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="cliente@email.com"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Notas opcionales sobre el cliente..."
          className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-base text-ink placeholder:text-neutral-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" onClick={onCancel} variant="outline" fullWidth disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" fullWidth disabled={loading || !firstName.trim() || !lastName.trim() || !phone.trim()}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {initial ? "Guardar cambios" : "Crear cliente"}
        </Button>
      </div>
    </form>
  );
}
