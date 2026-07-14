"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn, formatCurrency, formatTime } from "@/lib/utils";
import { useColaboradorCalendar } from "@/hooks/useColaboradorCalendar";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function ColaboradorCalendar() {
  const {
    appointments,
    loading,
    prevMonth,
    nextMonth,
    currentDate,
    daysWithAppointments,
  } = useColaboradorCalendar();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Lunes = 0
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek < 0) firstDayOfWeek = 6;

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentDate]);

  const todayKey = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
  })();

  const dayAppointments = useMemo(() => {
    if (!selectedDate) return [];
    const [y, m, d] = selectedDate.split("-").map(Number);
    return appointments
      .filter((a) => {
        const date = new Date(a.startAt);
        return (
          date.getFullYear() === y &&
          date.getMonth() === m &&
          date.getDate() === d
        );
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [selectedDate, appointments]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header mes */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-neutral-500 hover:text-ink"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-base font-semibold text-ink">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={nextMonth}
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-neutral-500 hover:text-ink"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Grid calendario */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-neutral-400">
            {d}
          </div>
        ))}
        {calendarDays.map((day, i) => {
          if (!day) return <div key={i} />;
          const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const hasAppts = daysWithAppointments.has(key);
          const isToday = key === todayKey;
          const isSelected = key === selectedDate;

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(key)}
              className={cn(
                "flex min-h-touch flex-col items-center justify-center rounded-lg text-sm transition-colors",
                isSelected
                  ? "bg-gold text-white"
                  : hasAppts
                    ? "bg-gold/10 text-ink"
                    : "text-neutral-600 hover:bg-neutral-50",
                isToday && !isSelected && "ring-1 ring-gold",
              )}
            >
              <span className="font-medium">{day.getDate()}</span>
              {hasAppts && !isSelected && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-gold" />
              )}
            </button>
          );
        })}
      </div>

      {/* Detalle del día seleccionado */}
      {selectedDate && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-700">
            Citas del {(() => {
              const [y, m, d] = selectedDate.split("-").map(Number);
              return new Date(y, m, d).toLocaleDateString("es-PE", {
                weekday: "long",
                day: "numeric",
                month: "long",
              });
            })()}
          </h3>

          {dayAppointments.length === 0 ? (
            <Card className="py-6 text-center text-sm text-neutral-400">
              No hay citas este día
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {dayAppointments.map((apt) => (
                <Card key={apt.id} className="flex items-start gap-3 p-3">
                  <div className="flex flex-col items-center">
                    <Clock className="h-4 w-4 text-gold" />
                    <span className="mt-1 text-xs font-medium text-ink">
                      {formatTime(apt.startAt)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{apt.clientName}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {apt.services.map((s) => (
                        <span
                          key={s}
                          className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={apt.status === "completada" ? "neutral" : "gold"}>
                        {apt.status}
                      </Badge>
                      <span className="text-sm font-medium text-gold">
                        {formatCurrency(apt.totalPrice)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}