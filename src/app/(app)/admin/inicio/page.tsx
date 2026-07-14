"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Users,
  AlertTriangle,
  TrendingUp,
  Plus,
  Loader2,
  Scissors,
  Briefcase,
  DollarSign,
  BarChart3,
  Wallet,
  Package,
} from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sheet, useSheetStore } from "@/components/ui/Sheet";
import { AppointmentCard } from "@/components/cards/AppointmentCard";
import { AppointmentForm } from "@/components/modals/AppointmentForm";
import { CashStatusBar } from "@/components/cash/CashStatusBar";
import { OpenCashRegister } from "@/components/cash/OpenCashRegister";
import { CloseCashRegister } from "@/components/cash/CloseCashRegister";
import { useAppointments } from "@/hooks/useAppointments";
import { useClients } from "@/hooks/useClients";
import { useInventory } from "@/hooks/useInventory";
import { useReports } from "@/hooks/useReports";
import { useCashRegister } from "@/hooks/useCashRegister";
import { formatCurrency } from "@/lib/utils";

const quickLinks = [
  { href: "/admin/servicios", label: "Servicios", icon: Scissors, color: "text-purple-600" },
  { href: "/admin/colaboradores", label: "Colaboradoras", icon: Briefcase, color: "text-pink-600" },
  { href: "/admin/comisiones", label: "Comisiones", icon: DollarSign, color: "text-green-600" },
  { href: "/admin/inventario", label: "Inventario", icon: Package, color: "text-orange-600" },
  { href: "/admin/cajas", label: "Cajas", icon: Wallet, color: "text-gold" },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3, color: "text-blue-600" },
];

export default function DashboardPage() {
  const { today, statusLabels, loading: aptLoading } = useAppointments();
  const { total: totalClients, loading: clientLoading } = useClients();
  const { lowStockCount, loading: invLoading } = useInventory();
  const { data: reports, loading: repLoading } = useReports();
  const { current, loading: cashLoading, open, close } = useCashRegister();
  const sheet = useSheetStore();
  const [saving, setSaving] = useState(false);
  const loading = aptLoading || clientLoading || invLoading || repLoading || cashLoading;

  const todayRevenue = useMemo(
    () => today.reduce((sum, a) => sum + Number(a.totalPrice), 0),
    [today],
  );

  const weekRevenue = useMemo(
    () => reports?.byDay?.reduce((s, d) => s + Number(d.revenue), 0) ?? 0,
    [reports],
  );

  const stats = [
    {
      label: "Citas hoy",
      value: today.length.toString(),
      icon: CalendarDays,
      color: "text-gold",
    },
    {
      label: "Clientes",
      value: totalClients.toString(),
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Stock bajo",
      value: lowStockCount.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      label: "Ingresos hoy",
      value: formatCurrency(todayRevenue),
      icon: TrendingUp,
      color: "text-green-600",
    },
  ];

  function openNewAppointment() {
    sheet.show(
      <AppointmentForm
        onSave={async (data) => {
          setSaving(true);
          try {
            const servicesList = await fetch("/api/services").then(r => r.json()).catch(() => []);
            const svc = servicesList.find((s: { id: string }) => s.id === data.serviceId);
            const durationMin = svc?.durationMin ?? 60;
            const start = new Date(data.startAt);
            const end = new Date(start.getTime() + durationMin * 60000);

            const res = await fetch("/api/appointments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                clientId: data.clientId,
                colaboradorId: data.colaboradorId,
                startAt: start.toISOString(),
                endAt: end.toISOString(),
                notes: data.notes,
                status: "pendiente",
                serviceIds: [data.serviceId],
              }),
            });
            if (res.ok) sheet.close();
          } finally {
            setSaving(false);
          }
        }}
        onCancel={sheet.close}
        loading={saving}
      />,
    );
  }

  function handleOpenCash() {
    sheet.show(
      <OpenCashRegister
        onSave={async (colaboradorId, montoInicial) => {
          setSaving(true);
          try { await open(colaboradorId, montoInicial); sheet.close(); } finally { setSaving(false); }
        }}
        onCancel={sheet.close}
        loading={saving}
      />,
    );
  }

  function handleCloseCash() {
    if (!current) return;
    sheet.show(
      <CloseCashRegister
        register={current}
        onSave={async (montoReal, notas) => {
          setSaving(true);
          try { await close(current.id, montoReal, notas); sheet.close(); } finally { setSaving(false); }
        }}
        onCancel={sheet.close}
        loading={saving}
      />,
    );
  }

  return (
    <>
      <TopBar title="Inicio" userName="Yvette" />

      <div className="mx-auto max-w-2xl space-y-6 p-4 md:max-w-4xl">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        )}

        {!loading && (
          <>
            <CashStatusBar
              current={current}
              loading={false}
              onOpen={handleOpenCash}
              onClose={handleCloseCash}
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="flex flex-col gap-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <p className="text-xl font-bold text-ink">{stat.value}</p>
                  <p className="text-xs text-neutral-500">{stat.label}</p>
                </Card>
              ))}
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink dark:text-white">Resumen de ingresos</h3>
                <Link
                  href="/admin/reportes"
                  className="text-xs font-medium text-gold hover:underline"
                >
                  Ver reportes completos →
                </Link>
              </div>
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-2xl font-bold text-ink dark:text-white">{formatCurrency(weekRevenue)}</p>
                  <p className="text-xs text-neutral-500">Esta semana</p>
                </div>
                <div className="pb-1">
                  <p className="text-sm font-medium text-green-600">{formatCurrency(todayRevenue)}</p>
                  <p className="text-xs text-neutral-500">Hoy</p>
                </div>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={openNewAppointment}>
              <Plus className="h-5 w-5" />
              Nueva cita
            </Button>

            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}>
                    <Card className="flex flex-col items-center gap-2 py-4 text-center transition-colors hover:bg-gold/5">
                      <Icon className={`h-5 w-5 ${link.color}`} />
                      <span className="text-xs font-medium text-ink dark:text-white">{link.label}</span>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">Citas de hoy</h2>
                <Badge variant="gold">{today.length}</Badge>
              </div>

              {today.length === 0 ? (
                <Card className="py-8 text-center text-sm text-neutral-400">
                  No hay citas programadas para hoy
                </Card>
              ) : (
                <div className="flex flex-col gap-3">
                  {today.map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      statusLabel={statusLabels[apt.status]}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Sheet />
    </>
  );
}
