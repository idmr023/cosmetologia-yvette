"use client";

import { useState, useEffect, useCallback } from "react";

export interface ReportData {
  revenue: number;
  appointmentCount: number;
  byColaborador: {
    colaboradorId: string;
    fullName: string;
    total: string;
    count: number;
  }[];
  topServices: {
    serviceId: string;
    name: string;
    count: number;
    revenue: string;
  }[];
  byDay: {
    date: string;
    count: number;
    revenue: string;
  }[];
  byStatus: {
    status: string;
    count: number;
  }[];
}

interface UseReportsReturn {
  data: ReportData | null;
  loading: boolean;
  error: string | null;
  desde: string;
  hasta: string;
  setDesde: (v: string) => void;
  setHasta: (v: string) => void;
  refresh: () => void;
}

export function useReports(): UseReportsReturn {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (desde) params.set("desde", desde);
      if (hasta) params.set("hasta", hasta);
      const res = await fetch(`/api/reports?${params}`);
      if (!res.ok) throw new Error("Error al cargar reportes");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [desde, hasta]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { data, loading, error, desde, setDesde, hasta, setHasta, refresh: fetchReports };
}
