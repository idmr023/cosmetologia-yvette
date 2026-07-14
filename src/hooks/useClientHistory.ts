"use client";

import { useState, useEffect, useCallback } from "react";

export interface ClientHistoryItem {
  id: string;
  appointmentId: string | null;
  serviceName: string;
  serviceCategory: string;
  appointmentDate: string | null;
  appointmentStatus: string | null;
  performedAt: string;
}

export function useClientHistory(clientId: string | null) {
  const [history, setHistory] = useState<ClientHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/history`);
      if (!res.ok) throw new Error("Error al cargar historial");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error };
}
