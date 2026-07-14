"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Calendar, Clock, User, MapPin, Phone, ArrowLeft, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

interface AppointmentDetail {
  id: string;
  clientName: string;
  clientPhone: string;
  services: string[];
  colaboradorName: string;
  startAt: string;
  status: string;
  totalPrice: string;
  notes: string | null;
}

export default function CitaPublicaPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/appointments/public?id=${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Error al cargar"))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pastel/20">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-pastel/20 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h1 className="text-xl font-semibold text-ink">Cita no encontrada</h1>
        <Link href="/" className="text-sm text-gold hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const statusVariant: Record<string, "gold" | "success" | "neutral" | "danger"> = {
    pendiente: "gold",
    confirmada: "success",
    completada: "neutral",
    cancelada: "danger",
  };
  const statusLabels: Record<string, string> = {
    pendiente: "Pendiente",
    confirmada: "Confirmada",
    completada: "Completada",
    cancelada: "Cancelada",
  };

  return (
    <div className="min-h-screen bg-pastel/20 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-ink">Detalle de cita</h1>
            <Badge variant={statusVariant[data?.status ?? "pendiente"]}>
              {statusLabels[data?.status ?? "pendiente"]}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gold" />
              <span className="font-medium text-ink">{data?.clientName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Phone className="h-4 w-4 text-gold" />
              {data?.clientPhone}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Calendar className="h-4 w-4 text-gold" />
              {data ? formatDate(data.startAt) : "—"}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Clock className="h-4 w-4 text-gold" />
              {data ? formatTime(data.startAt) : "—"}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <MapPin className="h-4 w-4 text-gold" /> En salón Yvette
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">
              Servicios
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data?.services.map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-3">
            <div className="flex justify-between text-base font-bold">
              <span className="text-neutral-600">Total</span>
              <span className="text-gold">{data ? formatCurrency(data.totalPrice) : "—"}</span>
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              Pagar en efectivo, Yape o Plin al momento de la cita
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}