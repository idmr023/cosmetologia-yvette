"use client";

import { useState, useEffect } from "react";
import { CalendarDays, DollarSign, Users, Clock, Loader2, ArrowUp, ArrowDown, Download } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn, formatCurrency } from "@/lib/utils";
import { exportToPDF, exportToCSV } from "@/lib/exportUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Analytics {
  totalRevenue: number;
  prevRevenue: number;
  totalAppointments: number;
  prevAppointments: number;
  newClients: number;
  prevClients: number;
  occupancyRate: number;
  avgRating: number;
  revenueByDay: { day: string; revenue: number; count: number }[];
  topServices: { name: string; count: number; revenue: number }[];
  topColaboradores: { name: string; count: number; revenue: number }[];
  hourlyDistribution: { hour: string; count: number }[];
  heatmap: { day: string; hour: string; count: number }[];
}

export default function AnaliticaPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/reports/analytics?period=${period}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("request failed");
        return r.json();
      })
      .then((d: Analytics) => {
        setData({
          totalRevenue: d.totalRevenue ?? 0,
          prevRevenue: d.prevRevenue ?? 0,
          totalAppointments: d.totalAppointments ?? 0,
          prevAppointments: d.prevAppointments ?? 0,
          newClients: d.newClients ?? 0,
          prevClients: d.prevClients ?? 0,
          occupancyRate: d.occupancyRate ?? 0,
          avgRating: d.avgRating ?? 0,
          revenueByDay: Array.isArray(d.revenueByDay) ? d.revenueByDay : [],
          topServices: Array.isArray(d.topServices) ? d.topServices : [],
          topColaboradores: Array.isArray(d.topColaboradores) ? d.topColaboradores : [],
          hourlyDistribution: Array.isArray(d.hourlyDistribution) ? d.hourlyDistribution : [],
          heatmap: Array.isArray(d.heatmap) ? d.heatmap : [],
        });
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [period]);

  function delta(current: number, previous: number) {
    if (previous === 0) return { pct: 100, up: true };
    const pct = ((current - previous) / previous) * 100;
    return { pct: Math.abs(pct), up: pct >= 0 };
  }

  function handleExportPDF() {
    if (!data) return;
    const headers = ["Métrica", "Valor"];
    const rows: (string | number)[][] = [
      ["Ingresos", formatCurrency(data.totalRevenue)],
      ["Citas", data.totalAppointments],
      ["Clientes nuevos", data.newClients],
      ["Ocupación", `${data.occupancyRate}%`],
      [],
      ["--- Ingresos por día ---", ""],
      ...data.revenueByDay.map((d) => [d.day, formatCurrency(d.revenue)]),
      [],
      ["--- Top servicios ---", ""],
      ...data.topServices.map((s) => [s.name, `${s.count} citas - ${formatCurrency(s.revenue)}`]),
    ];
    exportToPDF(`Analítica ${period}`, headers, rows, `analitica-${period}`);
  }

  function handleExportCSV() {
    if (!data) return;
    const headers = ["Día", "Ingresos", "Citas"];
    const rows = data.revenueByDay.map((d) => [d.day, d.revenue, d.count]);
    exportToCSV(`analitica-${period}`, headers, rows);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <>
        <TopBar title="Analítica" />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 p-4 text-center">
          <p className="text-sm text-neutral-500">Sin datos en este periodo</p>
          <p className="text-xs text-neutral-400">
            No se pudo cargar la analítica. Verifica tu conexión e inténtalo de nuevo.
          </p>
        </div>
      </>
    );
  }

  const revDelta = data ? delta(data.totalRevenue, data.prevRevenue) : null;

  return (
    <>
      <TopBar title="Analítica" />
      <div className="mx-auto max-w-4xl space-y-4 p-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            {(["7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  period === p
                    ? "bg-gold text-white"
                    : "border border-neutral-200 bg-white text-neutral-600",
                )}
              >
                {p === "7d" ? "7 días" : p === "30d" ? "30 días" : "90 días"}
              </button>
            ))}
          </div>
          {data && (
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExportPDF}>
                <Download className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportCSV}>
                CSV
              </Button>
            </div>
          )}
        </div>

        {data && (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiCard
                icon={<DollarSign className="h-5 w-5" />}
                label="Ingresos"
                value={formatCurrency(data.totalRevenue)}
                delta={revDelta}
              />
              <KpiCard
                icon={<CalendarDays className="h-5 w-5" />}
                label="Citas"
                value={String(data.totalAppointments)}
                delta={data ? delta(data.totalAppointments, data.prevAppointments) : null}
              />
              <KpiCard
                icon={<Users className="h-5 w-5" />}
                label="Clientes nuevos"
                value={String(data.newClients)}
                delta={data ? delta(data.newClients, data.prevClients) : null}
              />
              <KpiCard
                icon={<Clock className="h-5 w-5" />}
                label="Ocupación"
                value={`${data.occupancyRate}%`}
              />
            </div>

            <Card className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-ink">Ingresos por día</h3>
              {data.revenueByDay.length === 0 ? (
                <p className="py-10 text-center text-sm text-neutral-400">Sin datos en este periodo</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `S/${v}`} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), "Ingresos"]}
                      labelStyle={{ color: "#0A0A0A" }}
                    />
                    <Bar dataKey="revenue" fill="#C9A227" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-ink">Distribución por hora</h3>
              {data.hourlyDistribution.length === 0 ? (
                <p className="py-10 text-center text-sm text-neutral-400">Sin datos en este periodo</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value) => [`${value} citas`, "Citas"]}
                    />
                    <Bar dataKey="count" fill="#C9A227" radius={[4, 4, 0, 0]} opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            {data.heatmap.length > 0 && (
              <Card className="overflow-x-auto p-4">
                <h3 className="mb-3 text-sm font-semibold text-ink">Heatmap día × hora</h3>
                <div className="min-w-[500px]">
                  <div className="flex">
                    <div className="w-10 shrink-0" />
                    {Array.from({ length: 11 }, (_, i) => i + 9).map((h) => (
                      <div key={h} className="flex-1 text-center text-[10px] text-neutral-400">
                        {h}:00
                      </div>
                    ))}
                  </div>
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => {
                    const maxInDay = Math.max(
                      ...data.heatmap.filter((c) => c.day === day).map((c) => c.count),
                      1,
                    );
                    return (
                      <div key={day} className="flex items-center">
                        <div className="w-10 shrink-0 text-xs font-medium text-neutral-500">
                          {day}
                        </div>
                        {Array.from({ length: 11 }, (_, i) => i + 9).map((h) => {
                          const cell = data.heatmap.find((c) => c.day === day && c.hour === `${h}:00`);
                          const count = cell?.count ?? 0;
                          const intensity = count / maxInDay;
                          const bg =
                            count === 0
                              ? "bg-neutral-50"
                              : intensity > 0.66
                                ? "bg-gold/80"
                                : intensity > 0.33
                                  ? "bg-gold/40"
                                  : "bg-gold/15";
                          return (
                            <div
                              key={`${day}-${h}`}
                              className={`flex-1 rounded py-2 text-center text-xs font-medium ${bg}`}
                            >
                              {count > 0 ? count : ""}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <h3 className="mb-3 text-sm font-semibold text-ink">Servicios top</h3>
                <div className="space-y-2">
                  {data.topServices.length === 0 ? (
                    <p className="py-6 text-center text-sm text-neutral-400">Sin datos en este periodo</p>
                  ) : (
                    data.topServices.slice(0, 5).map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-neutral-400">{i + 1}</span>
                          <span className="text-ink">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          <span>{s.count} citas</span>
                          <span className="font-medium text-gold">{formatCurrency(s.revenue)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="mb-3 text-sm font-semibold text-ink">Colaboradoras top</h3>
                <div className="space-y-2">
                  {data.topColaboradores.length === 0 ? (
                    <p className="py-6 text-center text-sm text-neutral-400">Sin datos en este periodo</p>
                  ) : (
                    data.topColaboradores.slice(0, 5).map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-neutral-400">{i + 1}</span>
                          <span className="text-ink">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          <span>{c.count} citas</span>
                          <span className="font-medium text-gold">{formatCurrency(c.revenue)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function KpiCard({
  icon,
  label,
  value,
  delta,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: { pct: number; up: boolean } | null;
}) {
  return (
    <Card className="p-4">
      <div className="mb-1 flex items-center gap-2 text-xs text-neutral-400">
        {icon}
        {label}
      </div>
      <div className="text-xl font-bold text-ink">{value}</div>
      {delta && (
        <div
          className={cn(
            "mt-1 flex items-center gap-0.5 text-xs",
            delta.up ? "text-green-600" : "text-red-600",
          )}
        >
          {delta.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {delta.pct.toFixed(1)}% vs periodo anterior
        </div>
      )}
    </Card>
  );
}
