"use client";

import { TrendingUp, DollarSign, CalendarDays, BarChart3, Loader2 } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useReports } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/utils";

export default function ReportesPage() {
  const { data, loading, desde, setDesde, hasta, setHasta, refresh } = useReports();

  return (
    <>
      <TopBar title="Reportes" />

      <div className="mx-auto max-w-2xl space-y-4 p-4 md:max-w-4xl">
        {/* Filtros de fecha */}
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          </div>
          <Button size="sm" onClick={refresh}>Filtrar</Button>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : data ? (
          <>
            {/* Cards resumen */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Card className="flex flex-col gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <p className="text-xl font-bold text-ink">{formatCurrency(data.revenue)}</p>
                <p className="text-xs text-neutral-500">Ingresos</p>
              </Card>
              <Card className="flex flex-col gap-2">
                <CalendarDays className="h-5 w-5 text-gold" />
                <p className="text-xl font-bold text-ink">{data.appointmentCount}</p>
                <p className="text-xs text-neutral-500">Citas completadas</p>
              </Card>
              <Card className="flex flex-col gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <p className="text-xl font-bold text-ink">{data.topServices[0]?.name ?? "—"}</p>
                <p className="text-xs text-neutral-500">Servicio más popular</p>
              </Card>
              <Card className="flex flex-col gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <p className="text-xl font-bold text-ink">
                  {data.byColaborador.sort((a, b) => Number(b.total) - Number(a.total))[0]?.fullName ?? "—"}
                </p>
                <p className="text-xs text-neutral-500">Top colaboradora</p>
              </Card>
            </div>

            {/* Por estado */}
            <Card className="space-y-3">
              <h3 className="text-base font-semibold text-ink">Citas por estado</h3>
              <div className="flex flex-wrap gap-2">
                {data.byStatus.map((s) => (
                  <span
                    key={s.status}
                    className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm"
                  >
                    <strong>{s.count}</strong> {s.status}
                  </span>
                ))}
              </div>
            </Card>

            {/* Por colaboradora */}
            <Card className="space-y-3">
              <h3 className="text-base font-semibold text-ink">Ingresos por colaboradora</h3>
              {data.byColaborador.map((c) => (
                <div key={c.colaboradorId} className="flex items-center justify-between border-b border-neutral-100 pb-2 last:border-0">
                  <span className="text-sm font-medium text-ink">{c.fullName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400">{c.count} citas</span>
                    <span className="text-sm font-semibold text-gold">{formatCurrency(c.total)}</span>
                  </div>
                </div>
              ))}
              {data.byColaborador.length === 0 && (
                <p className="text-sm text-neutral-400">Sin datos en este período</p>
              )}
            </Card>

            {/* Servicios top */}
            <Card className="space-y-3">
              <h3 className="text-base font-semibold text-ink">Servicios más populares</h3>
              <div className="flex flex-col gap-2">
                {data.topServices.map((s, i) => (
                  <div key={s.serviceId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/10 text-xs font-bold text-gold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-ink">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-400">{s.count} veces</span>
                      <span className="text-sm font-medium text-gold">{formatCurrency(s.revenue)}</span>
                    </div>
                  </div>
                ))}
                {data.topServices.length === 0 && (
                  <p className="text-sm text-neutral-400">Sin datos en este período</p>
                )}
              </div>
            </Card>
          </>
        ) : (
          <div className="py-12 text-center text-sm text-neutral-400">
            No se pudieron cargar los reportes
          </div>
        )}
      </div>
    </>
  );
}
