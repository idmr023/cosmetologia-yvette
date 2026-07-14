"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface CalendarAppointment {
  id: string;
  clientName: string;
  clientPhone: string;
  services: string[];
  colaboradorName: string;
  startAt: string;
  status: string;
  totalPrice: string;
}

interface UseColaboradorCalendarReturn {
  appointments: CalendarAppointment[];
  loading: boolean;
  error: string | null;
  monthOffset: number;
  prevMonth: () => void;
  nextMonth: () => void;
  currentDate: Date;
  daysWithAppointments: Set<string>;
}

export function useColaboradorCalendar(): UseColaboradorCalendarReturn {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const currentDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    d.setDate(1);
    return d;
  }, [monthOffset]);

  const fetchAppointments = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error("Error al cargar citas");
      const data = await res.json();
      const userName = session.user.name?.split(" ")[0]?.toLowerCase() ?? "";
      const mine = data.filter((a: CalendarAppointment) =>
        a.colaboradorName?.toLowerCase().includes(userName),
      );
      setAppointments(mine);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const daysWithAppointments = useMemo(() => {
    const set = new Set<string>();
    for (const apt of appointments) {
      const d = new Date(apt.startAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      set.add(key);
    }
    return set;
  }, [appointments]);

  return {
    appointments,
    loading,
    error,
    monthOffset,
    prevMonth: () => setMonthOffset((v) => v - 1),
    nextMonth: () => setMonthOffset((v) => v + 1),
    currentDate,
    daysWithAppointments,
  };
}