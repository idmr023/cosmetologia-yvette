"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Loader2, ArrowLeft, ShoppingBag, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatBoletaNumber } from "@/lib/utils";

interface OrderItem {
  id: string;
  inventoryId: string;
  name: string;
  quantity: number;
  unitPrice: string;
}

interface Order {
  id: string;
  status: string;
  totalAmount: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  deliveryMethod: string;
  shippingAddress: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  clientName: string;
  clientPhone: string;
}

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const paymentLabels: Record<string, string> = {
  yape: "Yape",
  plin: "Plin",
  efectivo: "Efectivo",
  transferencia: "Transferencia bancaria",
  mercadopago: "Mercado Pago",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/orders/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Pedido no encontrado");
        return r.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pastel/20">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-pastel/20 px-4">
        <p className="text-base text-neutral-500">{error ?? "Pedido no encontrado"}</p>
        <Button variant="outline" onClick={() => router.push("/tienda")}>
          Volver a tienda
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pastel/20 pb-12">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-neutral-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-ink">Pedido confirmado</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Success banner */}
        <div className="rounded-2xl bg-green-50 p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <Check className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-ink">¡Pedido recibido!</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Te contactaremos por WhatsApp para coordinar la entrega.
          </p>
        </div>

        {/* Order info */}
        <div className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Código</span>
            <span className="font-mono text-xs text-ink">{formatBoletaNumber(order.id, order.createdAt)}</span>
          </div>
          <SummaryRow label="Estado" value={statusLabels[order.status] ?? order.status} />
          <SummaryRow label="Cliente" value={order.clientName} />
          <SummaryRow label="Teléfono" value={order.clientPhone} />
          <SummaryRow label="Fecha" value={new Date(order.createdAt).toLocaleDateString("es-PE", { dateStyle: "long" })} />
        </div>

        {/* Products */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="mb-3 text-sm font-semibold text-ink">Productos</p>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-neutral-400">Cantidad: {item.quantity}</p>
                </div>
                <p className="font-medium text-ink">
                  {formatCurrency((parseFloat(item.unitPrice) * item.quantity).toString())}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-base font-bold">
            <span className="text-neutral-600">Total</span>
            <span className="text-gold">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Delivery */}
        <div className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <MapPin className="h-4 w-4 text-gold" /> Entrega
          </div>
          <SummaryRow
            label="Método"
            value={order.deliveryMethod === "recojo" ? "Recojo en tienda" : "Delivery"}
          />
          {order.shippingAddress && (
            <SummaryRow label="Dirección" value={order.shippingAddress} />
          )}
          {order.notes && <SummaryRow label="Notas" value={order.notes} />}
        </div>

        {/* Payment */}
        <div className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <CreditCard className="h-4 w-4 text-gold" /> Pago
          </div>
          <SummaryRow
            label="Método"
            value={order.paymentMethod ? (paymentLabels[order.paymentMethod] ?? order.paymentMethod) : "Por definir"}
          />
          <SummaryRow
            label="Estado"
            value={order.paymentStatus === "pagado" ? "Pagado" : "Pendiente de pago"}
          />
          {(order.paymentMethod === "yape" || order.paymentMethod === "plin") && (
            <div className="mt-3 rounded-xl bg-pastel/30 px-4 py-3 text-center text-sm text-neutral-600">
              Te enviaremos el código QR por WhatsApp para que puedas pagar.
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" fullWidth onClick={() => router.push("/tienda")}>
            <ShoppingBag className="h-4 w-4" /> Seguir comprando
          </Button>
          <Button fullWidth onClick={() => router.push("/")}>
            Ir al inicio
          </Button>
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
