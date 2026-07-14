"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, CalendarDays, MapPin, User, Scissors } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Receipt, type ReceiptData } from "@/components/Receipt";
import { cn, formatCurrency } from "@/lib/utils";

interface ServiceOption {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  price: string;
}
interface ColaboradorOption {
  id: string;
  fullName: string;
  specialty: string | null;
}

type Step = "service" | "colaborador" | "datetime" | "modality" | "client" | "summary" | "done";
type Modality = "salon" | "domicilio";

export default function ReservarPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("service");
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [colaboradores, setColaboradores] = useState<ColaboradorOption[]>([]);
  const [domicilioRecargo, setDomicilioRecargo] = useState("0");
  const [loading, setLoading] = useState(true);

  const [serviceId, setServiceId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [colaboradorId, setColaboradorId] = useState<string | null>(null);
  const [startAt, setStartAt] = useState<string>("");
  const [modality, setModality] = useState<Modality>("salon");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    fetch("/api/appointments/public")
      .then((r) => r.json())
      .then((data) => {
        setServices(data.services ?? []);
        setColaboradores(data.colaboradores ?? []);
        setDomicilioRecargo(data.domicilioRecargo ?? "0");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(services.map((s) => s.category)));
  const filteredServices = categoryFilter
    ? services.filter((s) => s.category === categoryFilter)
    : services;

  const selectedService = filteredServices.find((s) => s.id === serviceId);
  const selectedColaborador = colaboradores.find((c) => c.id === colaboradorId);
  const recargo = modality === "domicilio" ? Number(domicilioRecargo) : 0;
  const totalPrice = selectedService ? Number(selectedService.price) + recargo : 0;

  const steps: { key: Step; label: string }[] = [
    { key: "service", label: "Servicio" },
    { key: "colaborador", label: "Especialista" },
    { key: "datetime", label: "Fecha y hora" },
    { key: "modality", label: "Modalidad" },
    { key: "client", label: "Tus datos" },
    { key: "summary", label: "Resumen" },
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === step);

  function next() {
    const order: Step[] = ["service", "colaborador", "datetime", "modality", "client", "summary", "done"];
    const idx = order.indexOf(step);
    if (idx < order.length - 1) setStep(order[idx + 1]);
  }
  function prev() {
    const order: Step[] = ["service", "colaborador", "datetime", "modality", "client", "summary", "done"];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          colaboradorId,
          startAt,
          modality,
          clientName,
          clientPhone,
          clientEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Error al reservar");
        setSubmitting(false);
        return;
      }
      setReceiptData(data);
      setStep("done");
    } catch {
      alert("Error de conexión");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pastel/20">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (step === "done" && receiptData) {
    return <Receipt data={receiptData} onBack={() => router.push("/")} />;
  }

  const canNext =
    (step === "service" && serviceId) ||
    (step === "colaborador" && colaboradorId) ||
    (step === "datetime" && startAt) ||
    step === "modality" ||
    (step === "client" && clientName && clientPhone);

  return (
    <div className="min-h-screen bg-pastel/20 pb-24">
      {/* Header con progreso */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 flex items-center justify-between">
            <button
              onClick={prev}
              className={cn(
                "flex min-h-touch min-w-touch items-center justify-center rounded-lg text-neutral-500",
                step === "service" && "invisible",
              )}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-ink">Reservar cita</h1>
            <div className="min-w-touch" />
          </div>
          <div className="flex gap-1">
            {steps.map((s, i) => (
              <div
                key={s.key}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i <= currentStepIndex ? "bg-gold" : "bg-neutral-200",
                )}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Step 1: Servicio */}
        {step === "service" && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => { setCategoryFilter(null); setServiceId(null); }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  !categoryFilter
                    ? "bg-gold text-white"
                    : "border border-neutral-200 bg-white text-neutral-600"
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategoryFilter(cat); setServiceId(null); }}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    categoryFilter === cat
                      ? "bg-gold text-white"
                      : "border border-neutral-200 bg-white text-neutral-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
            {filteredServices.map((s) => (
              <button
                key={s.id}
                onClick={() => setServiceId(s.id)}
                className={cn(
                  "flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all",
                  serviceId === s.id
                    ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                    : "border-neutral-200 bg-white hover:border-gold/30",
                )}
              >
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                  {s.category}
                </span>
                <span className="text-base font-semibold text-ink">{s.name}</span>
                <span className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
                  <Scissors className="h-3.5 w-3.5" /> {s.durationMin} min
                  <span className="font-medium text-gold">{formatCurrency(s.price)}</span>
                </span>
              </button>
            ))}
          </div>
          </>
        )}

        {/* Step 2: Colaboradora */}
        {step === "colaborador" && (
          <div className="grid gap-3">
            {colaboradores.map((c) => (
              <button
                key={c.id}
                onClick={() => setColaboradorId(c.id)}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                  colaboradorId === c.id
                    ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                    : "border-neutral-200 bg-white hover:border-gold/30",
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pastel/50 text-lg font-semibold text-gold">
                  {c.fullName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-ink">{c.fullName}</p>
                  <p className="text-sm text-neutral-500">{c.specialty ?? "Especialista"}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Fecha y hora */}
        {step === "datetime" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <CalendarDays className="h-5 w-5 text-gold" />
              Elige fecha y hora
            </div>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
            <p className="text-xs text-neutral-400">
              Horario de atención: Lunes a Sábado, 9:00 AM a 7:00 PM
            </p>
          </div>
        )}

        {/* Step 4: Modalidad */}
        {step === "modality" && (
          <div className="grid gap-3">
            <button
              onClick={() => setModality("salon")}
              className={cn(
                "flex items-start gap-4 rounded-2xl border p-5 text-left transition-all",
                modality === "salon"
                  ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                  : "border-neutral-200 bg-white",
              )}
            >
              <MapPin className="h-6 w-6 shrink-0 text-gold" />
              <div>
                <p className="text-base font-semibold text-ink">En salón Yvette</p>
                <p className="text-sm text-neutral-500">Cercado de Lima · Sin recargo</p>
              </div>
            </button>
            <button
              onClick={() => setModality("domicilio")}
              className={cn(
                "flex items-start gap-4 rounded-2xl border p-5 text-left transition-all",
                modality === "domicilio"
                  ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                  : "border-neutral-200 bg-white",
              )}
            >
              <MapPin className="h-6 w-6 shrink-0 text-gold" />
              <div>
                <p className="text-base font-semibold text-ink">A domicilio</p>
                <p className="text-sm text-neutral-500">
                  Sin recargo adicional
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Step 5: Datos cliente */}
        {step === "client" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <User className="h-5 w-5 text-gold" /> Tus datos
            </div>
            <Input
              id="clientName"
              label="Nombre completo"
              type="text"
              placeholder="Tu nombre"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
            <Input
              id="clientPhone"
              label="Teléfono / WhatsApp"
              type="tel"
              placeholder="987654321"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              required
            />
            <Input
              id="clientEmail"
              label="Email (opcional)"
              type="email"
              placeholder="tu@email.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
        )}

        {/* Step 6: Resumen */}
        {step === "summary" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-ink">Resumen de tu cita</h2>
            <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
              {selectedService && (
                <SummaryRow label="Servicio" value={selectedService.name} />
              )}
              {selectedColaborador && (
                <SummaryRow label="Especialista" value={selectedColaborador.fullName} />
              )}
              <SummaryRow
                label="Fecha y hora"
                value={startAt ? new Date(startAt).toLocaleString("es-PE") : "—"}
              />
              <SummaryRow
                label="Modalidad"
                value={modality === "salon" ? "En salón Yvette" : "A domicilio"}
              />
              <SummaryRow label="Cliente" value={clientName} />
              <SummaryRow label="Teléfono" value={clientPhone} />
              {selectedService && (
                <div className="border-t border-neutral-100 pt-3">
                  <SummaryRow
                    label="Servicio"
                    value={formatCurrency(selectedService.price)}
                  />
                  {modality === "domicilio" && (
                    <SummaryRow
                      label="Recargo domicilio"
                      value={formatCurrency(domicilioRecargo)}
                    />
                  )}
                  <div className="mt-2 flex justify-between text-lg font-bold">
                    <span className="text-neutral-600">Total</span>
                    <span className="text-gold">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-xl bg-pastel/30 px-4 py-3 text-center text-sm text-neutral-600">
              Pagar en efectivo, Yape o Plin al momento de la cita
            </div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      {step !== "done" && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white/95 p-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
            <div className="flex-1">
              {selectedService && (
                <p className="text-sm text-neutral-500">
                  Total:{" "}
                  <span className="font-semibold text-gold">
                    {formatCurrency(totalPrice)}
                  </span>
                </p>
              )}
            </div>
            {step === "summary" ? (
              <Button onClick={handleConfirm} size="lg" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Check className="h-5 w-5" /> Confirmar
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={next} size="lg" disabled={!canNext}>
                Continuar <ArrowRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}