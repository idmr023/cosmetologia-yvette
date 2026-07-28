"use client";

import { useState, useEffect, useMemo } from "react";
import { Save, Loader2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { appointmentSchema, type AppointmentFormData } from "@/lib/schemas";
import { apiFetch } from "@/lib/api";

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
  dni: string | null;
  phone: string;
}

interface AppointmentFormProps {
  onSave: (data: {
    clientId: string;
    serviceIds: string[];
    colaboradorId: string;
    startAt: string;
    endAt: string;
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

  // Cliente: búsqueda o crear nuevo
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientOpt | null>(null);
  const [newName, setNewName] = useState("");
  const [newDni, setNewDni] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientId: "",
      serviceIds: [],
      colaboradorId: "",
      startAt: "",
      notes: "",
    },
  });

  const selectedServiceIds = watch("serviceIds");

  const totalDuration = useMemo(() => {
    return services
      .filter((s) => selectedServiceIds.includes(s.id))
      .reduce((sum, s) => sum + s.durationMin, 0);
  }, [services, selectedServiceIds]);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/services").then((r) => r.json()),
      apiFetch("/api/colaboradores").then((r) => r.json()),
      apiFetch("/api/clients").then((r) => r.json()),
    ])
      .then(([svc, col, cli]) => {
        setServices(svc.data ?? svc);
        setColaboradores(col.data ?? col);
        setClients(cli.data ?? cli);
      })
      .finally(() => setLoadingData(false));
  }, []);

  function toggleService(id: string) {
    const current = selectedServiceIds ?? [];
    if (current.includes(id)) {
      setValue("serviceIds", current.filter((s) => s !== id), { shouldValidate: true });
    } else {
      setValue("serviceIds", [...current, id], { shouldValidate: true });
    }
  }

  const filteredClients = clients.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      (c.dni?.includes(search) ?? false) ||
      c.phone.includes(search),
  );

  async function onSubmit(data: AppointmentFormData) {
    let clientId = selectedClient?.id;

    if (!clientId && newName.trim() && /^\d{8}$/.test(newDni) && newPhone.trim()) {
      try {
        const res = await apiFetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: newName.split(" ")[0],
            lastName: newName.split(" ").slice(1).join(" ") || "Cliente",
            dni: newDni,
            phone: newPhone,
          }),
        });
        if (res.ok) {
          const created = await res.json();
          clientId = created.id;
        }
      } catch {
        // error handled by parent
      }
    }

    if (!clientId) return;

    const start = new Date(data.startAt);
    const end = new Date(start.getTime() + totalDuration * 60_000);
    const endAt = end.toISOString();

    await onSave({
      clientId,
      serviceIds: data.serviceIds,
      colaboradorId: data.colaboradorId,
      startAt: data.startAt,
      endAt,
      notes: data.notes ?? "",
    });
  }

  if (loadingData) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                      setValue("clientId", c.id, { shouldValidate: true });
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
                id="apt-dni"
                placeholder="DNI (8 dígitos)"
                inputMode="numeric"
                maxLength={8}
                value={newDni}
                onChange={(e) => setNewDni(e.target.value.replace(/\D/g, ""))}
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
              onClick={() => {
                setSelectedClient(null);
                setValue("clientId", "", { shouldValidate: true });
              }}
              className="text-xs text-gold hover:underline"
            >
              Cambiar
            </button>
          </div>
        )}
      </div>

      {/* Servicios (multi-select) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">
          Servicios {totalDuration > 0 && <span className="text-neutral-400">— {totalDuration} min total</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => {
            const selected = selectedServiceIds.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleService(s.id)}
                className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  selected
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
                }`}
              >
                {s.name} — {formatCurrency(s.price)}
              </button>
            );
          })}
        </div>
        {errors.serviceIds && (
          <p className="text-sm text-red-600">{errors.serviceIds.message}</p>
        )}
      </div>

      {/* Colaboradora */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Colaboradora</label>
        <select
          {...register("colaboradorId")}
          className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        >
          <option value="">Seleccionar colaboradora</option>
          {colaboradores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName}{c.specialty ? ` — ${c.specialty}` : ""}
            </option>
          ))}
        </select>
        {errors.colaboradorId && (
          <p className="text-sm text-red-600">{errors.colaboradorId.message}</p>
        )}
      </div>

      {/* Fecha y hora */}
      <Input
        id="apt-datetime"
        label="Fecha y hora"
        type="datetime-local"
        error={errors.startAt?.message}
        {...register("startAt")}
      />

      {/* Notas */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Notas</label>
        <textarea
          {...register("notes")}
          rows={2}
          placeholder="Notas opcionales..."
          className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-base text-ink placeholder:text-neutral-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" onClick={onCancel} variant="outline" fullWidth disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Crear cita
        </Button>
      </div>
    </form>
  );
}
