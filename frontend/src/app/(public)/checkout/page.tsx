"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, User, CreditCard, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";

type Step = "client" | "delivery" | "payment" | "summary" | "done";
type DeliveryMethod = "recojo" | "delivery";
type PaymentMethod = "yape" | "plin" | "efectivo" | "transferencia" | "mercadopago";

const paymentLabels: Record<PaymentMethod, string> = {
  yape: "Yape",
  plin: "Plin",
  efectivo: "Efectivo",
  transferencia: "Transferencia bancaria",
  mercadopago: "Mercado Pago",
};

const PAYMENT_METHODS: { value: PaymentMethod; description: string }[] = [
  { value: "yape", description: "Código QR al recoger" },
  { value: "plin", description: "Código QR al recoger" },
  { value: "efectivo", description: "Paga en efectivo al recoger" },
  { value: "transferencia", description: "Depósito o transferencia bancaria" },
  { value: "mercadopago", description: "Paga con tarjeta o Mercado Pago" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCartStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("recojo");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<Step>("client");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  if (items.length === 0 && step !== "done") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-pastel/20 px-4">
        <ShoppingBag className="h-12 w-12 text-neutral-300" />
        <p className="text-base text-neutral-500">Tu carrito está vacío</p>
        <Button onClick={() => router.push("/tienda")}>Ir a tienda</Button>
      </div>
    );
  }

  const steps: { key: Step; label: string }[] = [
    { key: "client", label: "Datos" },
    { key: "delivery", label: "Entrega" },
    { key: "payment", label: "Pago" },
    { key: "summary", label: "Resumen" },
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === step);
  const total = totalAmount();

  function next() {
    const order: Step[] = ["client", "delivery", "payment", "summary", "done"];
    const idx = order.indexOf(step);
    if (idx < order.length - 1) setStep(order[idx + 1]);
  }
  function prev() {
    const order: Step[] = ["client", "delivery", "payment", "summary", "done"];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  }

  const canNext =
    (step === "client" && firstName && phone) ||
    step === "delivery" ||
    (step === "payment" && paymentMethod);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            inventoryId: i.inventoryId,
            quantity: i.quantity,
          })),
          firstName,
          lastName,
          phone,
          email: email || undefined,
          deliveryMethod,
          shippingAddress: deliveryMethod === "delivery" ? shippingAddress : undefined,
          notes: notes || undefined,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Error al procesar el pedido", "error");
        setSubmitting(false);
        return;
      }
      setOrderId(data.id);
      clearCart();
      setStep("done");
    } catch {
      toast("Error de conexión", "error");
    }
    setSubmitting(false);
  }

  if (step === "done") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-pastel/20 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-center text-xl font-bold text-ink">Pedido confirmado</h1>
        <p className="text-center text-sm text-neutral-500">
          Recibirás la confirmación por WhatsApp.
        </p>
        {orderId && (
          <p className="text-sm text-neutral-400">Código: {orderId.slice(0, 8)}...</p>
        )}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/tienda")}>
            Seguir comprando
          </Button>
          <Button onClick={() => router.push("/")}>Ir al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pastel/20 pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 flex items-center justify-between">
            <button
              onClick={prev}
              className={cn(
                "flex min-h-touch min-w-touch items-center justify-center rounded-lg text-neutral-500",
                step === "client" && "invisible",
              )}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-ink">Checkout</h1>
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

        {/* Step 1: Client data */}
        {step === "client" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <User className="h-5 w-5 text-gold" /> Tus datos
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="mb-3 text-xs leading-relaxed text-neutral-500">
                Completa tus datos para procesar el pedido. Los usaremos para contactarte.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="firstName"
                  label="Nombre"
                  type="text"
                  placeholder="Nombres"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  id="lastName"
                  label="Apellido"
                  type="text"
                  placeholder="Apellidos"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="mt-4">
                <Input
                  id="phone"
                  label="Teléfono / WhatsApp"
                  type="tel"
                  placeholder="987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="mt-4">
                <Input
                  id="email"
                  label="Email (opcional)"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Delivery method */}
        {step === "delivery" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <MapPin className="h-5 w-5 text-gold" /> Método de entrega
            </div>
            <div className="grid gap-3">
              <button
                onClick={() => setDeliveryMethod("recojo")}
                className={cn(
                  "flex items-start gap-4 rounded-2xl border p-5 text-left transition-all",
                  deliveryMethod === "recojo"
                    ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                    : "border-neutral-200 bg-white",
                )}
              >
                <MapPin className="h-6 w-6 shrink-0 text-gold" />
                <div>
                  <p className="text-base font-semibold text-ink">Recojo en tienda</p>
                  <p className="text-sm text-neutral-500">Cercado de Lima — Sin costo</p>
                </div>
              </button>
              <button
                onClick={() => setDeliveryMethod("delivery")}
                className={cn(
                  "flex items-start gap-4 rounded-2xl border p-5 text-left transition-all",
                  deliveryMethod === "delivery"
                    ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                    : "border-neutral-200 bg-white",
                )}
              >
                <MapPin className="h-6 w-6 shrink-0 text-gold" />
                <div>
                  <p className="text-base font-semibold text-ink">Delivery</p>
                  <p className="text-sm text-neutral-500">Consulta el costo con tu asesora</p>
                </div>
              </button>
            </div>
            {deliveryMethod === "delivery" && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <Input
                  id="address"
                  label="Dirección de envío"
                  type="text"
                  placeholder="Calle, número, referencia..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Algún detalle que debamos saber..."
                className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 3: Payment method */}
        {step === "payment" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <CreditCard className="h-5 w-5 text-gold" /> Método de pago
            </div>
            <div className="grid gap-3">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.value}
                  onClick={() => setPaymentMethod(pm.value)}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                    paymentMethod === pm.value
                      ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                      : "border-neutral-200 bg-white hover:border-gold/30",
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pastel/50 text-lg font-semibold text-gold">
                    {pm.value.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-ink">{paymentLabels[pm.value]}</p>
                    <p className="text-sm text-neutral-500">{pm.description}</p>
                  </div>
                  {paymentMethod === pm.value && (
                    <Check className="h-5 w-5 text-gold" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {step === "summary" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-ink">Resumen del pedido</h2>

            {/* Products */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="mb-3 text-sm font-semibold text-ink">Productos</p>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.inventoryId} className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-neutral-400">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-ink">
                      {formatCurrency((parseFloat(item.price) * item.quantity).toString())}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-base font-bold">
                <span className="text-neutral-600">Total</span>
                <span className="text-gold">{formatCurrency(total.toString())}</span>
              </div>
            </div>

            {/* Client info */}
            <div className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-5">
              <SummaryRow label="Nombre" value={`${firstName} ${lastName}`} />
              <SummaryRow label="Teléfono" value={phone} />
              {email && <SummaryRow label="Email" value={email} />}
            </div>

            {/* Delivery info */}
            <div className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-5">
              <SummaryRow
                label="Entrega"
                value={deliveryMethod === "recojo" ? "Recojo en tienda" : "Delivery"}
              />
              {deliveryMethod === "delivery" && shippingAddress && (
                <SummaryRow label="Dirección" value={shippingAddress} />
              )}
              {notes && <SummaryRow label="Notas" value={notes} />}
            </div>

            {/* Payment info */}
            {paymentMethod && (
              <div className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-5">
                <SummaryRow label="Pago" value={paymentLabels[paymentMethod]} />
              </div>
            )}

            <div className="rounded-xl bg-pastel/30 px-4 py-3 text-center text-sm text-neutral-600">
              {paymentMethod === "yape" || paymentMethod === "plin"
                ? "Te enviaremos el código QR por WhatsApp para que puedas pagar."
                : "Confirma el método de pago al recoger tu pedido."}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white/95 p-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-neutral-500">
              Total:{" "}
              <span className="font-semibold text-gold">{formatCurrency(total.toString())}</span>
            </p>
          </div>
          {step === "summary" ? (
            <Button onClick={handleConfirm} size="lg" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <><Check className="h-5 w-5" /> Confirmar pedido</>
              )}
            </Button>
          ) : (
            <Button onClick={next} size="lg" disabled={!canNext}>
              Continuar <ArrowRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
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
