"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  notes: string | null;
  createdAt: string | null;
}

interface UseClientsReturn {
  clients: Client[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (v: string) => void;
  total: number;
  create: (data: Partial<Client>) => Promise<void>;
  update: (id: string, data: Partial<Client>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Error al cargar clientes");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.phone.includes(q),
    );
  }, [clients, search]);

  const create = useCallback(async (data: Partial<Client>) => {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear cliente");
    await fetchClients();
  }, [fetchClients]);

  const update = useCallback(async (id: string, data: Partial<Client>) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar cliente");
    await fetchClients();
  }, [fetchClients]);

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar cliente");
    await fetchClients();
  }, [fetchClients]);

  return {
    clients: filtered,
    loading,
    error,
    search,
    setSearch,
    total: clients.length,
    create,
    update,
    remove,
  };
}
