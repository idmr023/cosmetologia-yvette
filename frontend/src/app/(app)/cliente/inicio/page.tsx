"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Award, ShoppingBag, Star } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SectionRow } from "@/components/ui/SectionRow";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

interface Appointment {
  id: string;
  startAt: string;
  status: string;
  totalPrice: string;
  colaborador: { fullName: string };
  services: { service: { name: string } }[];
}

interface LoyaltyData {
  points: number;
  tier: { name: string; color: string } | null;
}

export default function ClienteInicioPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientId = session?.user?.clientId;
    if (!clientId) {
      setLoading(false);
      return;
    }

    Promise.all([
      apiFetch("/api/appointments/mine").then((r) => r.json()),
      apiFetch(`/api/loyalty/points/${clientId}`).then((r) => r.json()),
    ])
      .then(([aptData, loyaltyData]) => {
        setAppointments(aptData.data ?? []);
        setLoyalty(loyaltyData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session?.user?.clientId]);

  if (loading) {
    return (
      <>
        <TopBar title="Inicio" />
        <LoadingSpinner className="py-16" />
      </>
    );
  }

  const upcoming = appointments
    .filter(
      (a) =>
        (a.status === "pendiente" || a.status === "confirmada") &&
        new Date(a.startAt) > new Date(),
    )
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const nextApt = upcoming[0];

  return (
    <>
      <TopBar title="Inicio" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <Card className="border-gold/20 bg-gold/5 p-4">
          <p className="text-sm text-neutral-500">Bienvenido(a)</p>
          <p className="text-lg font-semibold text-ink dark:text-white">
            {session?.user?.name}
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/cliente/citas">
            <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-gold/5">
              <CalendarDays className="h-5 w-5 text-gold" />
              <div>
                <p className="text-xs text-neutral-500">Próxima cita</p>
                <p className="text-sm font-medium text-ink dark:text-white">
                  {nextApt
                    ? formatDate(new Date(nextApt.startAt))
                    : "Sin citas"}
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/cliente/fidelizacion">
            <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-gold/5">
              <Award className="h-5 w-5 text-gold" />
              <div>
                <p className="text-xs text-neutral-500">Puntos</p>
                <p className="text-sm font-medium text-ink dark:text-white">
                  {loyalty?.points ?? 0} pts
                </p>
              </div>
            </Card>
          </Link>
        </div>

        {nextApt && (
          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink dark:text-white">
                Próxima Cita
              </h3>
              <Link
                href="/cliente/citas"
                className="text-xs text-gold hover:underline"
              >
                Ver todas
              </Link>
            </div>
            <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
              <p>
                {formatDate(new Date(nextApt.startAt))} a las{" "}
                {formatTime(new Date(nextApt.startAt))}
              </p>
              <p>Con: {nextApt.colaborador.fullName}</p>
              <p>
                Servicios:{" "}
                {nextApt.services.map((s) => s.service.name).join(", ")}
              </p>
              <p className="font-medium text-ink dark:text-white">
                Total: {formatCurrency(parseFloat(nextApt.totalPrice))}
              </p>
            </div>
          </Card>
        )}

        <div className="space-y-2">
          <SectionRow href="/cliente/citas" icon={CalendarDays} label="Mis Citas" />
          <SectionRow href="/cliente/ordenes" icon={ShoppingBag} label="Mis Órdenes" />
          <SectionRow href="/cliente/resenas" icon={Star} label="Mis Reseñas" />
        </div>
      </div>
    </>
  );
}
