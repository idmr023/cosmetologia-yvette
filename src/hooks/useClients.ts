"use client";

import { useState, useMemo } from "react";
import { useCrud } from "@/hooks/useCrud";

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dni: string | null;
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
  create: (data: Record<string, unknown>) => Promise<void>;
  update: (id: string, data: Record<string, unknown>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useClients(): UseClientsReturn {
  const crud = useCrud<Client>("/api/clients");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return crud.data;
    return crud.data.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        (c.dni?.includes(q) ?? false) ||
        c.phone.includes(q),
    );
  }, [crud.data, search]);

  return {
    clients: filtered,
    loading: crud.loading,
    error: crud.error,
    search,
    setSearch,
    total: crud.data.length,
    create: crud.create as unknown as UseClientsReturn["create"],
    update: crud.update as unknown as UseClientsReturn["update"],
    remove: crud.remove,
  };
}
