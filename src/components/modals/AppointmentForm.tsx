"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";

interface ServiceOpt {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  price: string;
}

interface ColaboradorOpt {
  id: string;
  fullName: string;
  specialty: string | null;
}

interface ClientOpt {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface AppointmentFormProps {
  onSave: (data: {
    clientId: string;
    serviceId: string;
    colaboradorId: string;
    startAt: string;
    notes: string;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function AppointmentForm({ onSave, onCancel, loading }: AppointmentFormProps) {
  const [services, setServices] = useState<ServiceOpt[]>([]);
  const [colaboradores, setColaboradores] = useState<ColaboradorOpt[]>([]);
  const [clients, setClients] = useState<ClientOpt[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [serviceId, setServiceId] = useState("");
  const [colaboradorId, setColaboradorId] = useState("");
  const [startAt, setStartAt] = useState("");
  const [notes, setNotes] = useState("");

  // Cliente: búsqueda o crear nuevo
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientOpt | null>(null);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/colaboradores").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ])
      .then(([svc, col, cli]) => {
        setServices(svc);
        setColaboradores(col);
        setClients(cli);
      })
      .finally(() => setLoadingData(false));
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let clientId = selectedClient?.id;

    // Crear cliente si no existe
    if (!clientId && newName.trim() && newPhone.trim()) {
      try {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: newName.split(" ")[0],
            lastName: newName.split(" ").slice(1).join(" ") || "Cliente",
            phone: newPhone,
          }),
        });
        if (res.ok) {
          const created = await res.json();
          clientId = created.id;
        }
      } catch {
        // error handled by hook
      }
    }

    if (!clientId || !serviceId || !colaboradorId || !startAt) return;

    await onSave({
      clientId,
      serviceId,
      colaboradorId,
      startAt,
      notes,
    });
  }

  if (loadingData) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  const canSubmit = (selectedClient || (newName.trim() && newPhone.trim())) && serviceId && colaboradorId && startAt;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-ink">Nueva cita</h2>

      {/* Cliente */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Cliente</label>
        {!selectedClient ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente existente..."
                className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-4 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>
            {search && (
              <div className="max-h-40 overflow-y-auto rounded-xl border border-neutral-200 bg-white">
                {filteredClients.slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedClient(c);
                      setSearch("");
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-neutral-50"
                  >
                    <span className="font-medium text-ink">{c.firstName} {c.lastName}</span>
                    <span className="text-neutral-400">{c.phone}</span>
                  </button>
                ))}
                {filteredClients.length === 0 && (
                  <p className="px-3 py-2 text-sm text-neutral-400">
                    No encontrado. Llena los datos de nuevo cliente abajo.
                  </p>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Input
                id="apt-name"
                placeholder="Nombre nuevo cliente"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Input
                id="apt-phone"
                placeholder="Teléfono"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">
                {selectedClient.firstName} {selectedClient.lastName}
              </p>
              <p className="text-xs text-neutral-400">{selectedClient.phone}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedClient(null)}
              className="text-xs text-gold hover:underline"
            >
              Cambiar
            </button>
          </div>
        )}
      </div>

      {/* Servicio */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Servicio</label>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        >
          <option value="">Seleccionar servicio</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {formatCurrency(s.price)} ({s.durationMin} min)
            </option>
          ))}
        </select>
      </div>

      {/* Colaboradora */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Colaboradora</label>
        <select
          value={colaboradorId}
          onChange={(e) => setColaboradorId(e.target.value)}
          className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        >
          <option value="">Seleccionar colaboradora</option>
          {colaboradores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName}{c.specialty ? ` — ${c.specialty}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Fecha y hora */}
      <Input
        id="apt-datetime"
        label="Fecha y hora"
        type="datetime-local"
        value={startAt}
        onChange={(e) => setStartAt(e.target.value)}
        required
      />

      {/* Notas */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Notas opcionales..."
          className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-base text-ink placeholder:text-neutral-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" onClick={onCancel} variant="outline" fullWidth disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" fullWidth disabled={loading || !canSubmit}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Crear cita
        </Button>
      </div>
    </form>
  );
}
