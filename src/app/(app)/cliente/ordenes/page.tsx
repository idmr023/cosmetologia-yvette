"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Plus } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { InfoCard } from "@/components/ui/InfoCard";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderItem {
  id: string;
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
  deliveryMethod: string | null;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  enviado: "bg-blue-100 text-blue-800",
  entregado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

export default function ClienteOrdenesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders/mine")
      .then((r) => r.json())
      .then((data) => setOrders(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <TopBar title="Mis Órdenes" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <InfoCard
          icon={ShoppingBag}
          action={
            <Link href="/tienda">
              <Button variant="secondary" size="sm">
                <Plus className="h-4 w-4" />
                Ir a la tienda
              </Button>
            </Link>
          }
        >
          <p className="text-sm text-neutral-600">
            <strong className="text-ink">{orders.length}</strong> órdenes
          </p>
        </InfoCard>

        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <EmptyState message="No tienes órdenes registradas" />
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs text-neutral-500">
                    {formatDate(new Date(order.createdAt))}
                  </p>
                  <Badge
                    className={
                      STATUS_COLORS[order.status] ?? "bg-neutral-100 text-neutral-800"
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400"
                    >
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>{formatCurrency(parseFloat(item.unitPrice) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border-t border-neutral-100 pt-2 dark:border-neutral-800">
                  <div className="flex justify-between text-sm font-medium text-ink dark:text-white">
                    <span>Total</span>
                    <span>{formatCurrency(parseFloat(order.totalAmount))}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
