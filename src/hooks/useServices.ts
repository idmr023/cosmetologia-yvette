"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

export interface Service {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  price: string;
  description: string | null;
  isActive: boolean;
}

interface UseServicesReturn {
  services: Service[];
  loading: boolean;
  error: string | null;
  filter: string;
  setFilter: (v: string) => void;
  categories: string[];
  create: (data: Partial<Service>) => Promise<Service>;
  update: (id: string, data: Partial<Service>) => Promise<Service>;
  remove: (id: string) => Promise<void>;
}

export function useServices(): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error("Error al cargar servicios");
      const data = await res.json();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const categories = useMemo(() => {
    const cats = new Set(services.map((s) => s.category));
    return Array.from(cats).sort();
  }, [services]);

  const filtered = useMemo(() => {
    if (filter === "all") return services;
    return services.filter((s) => s.category === filter);
  }, [services, filter]);

  const create = useCallback(
    async (data: Partial<Service>) => {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al crear servicio");
      const created = await res.json();
      await fetchServices();
      return created as Service;
    },
    [fetchServices],
  );

  const update = useCallback(
    async (id: string, data: Partial<Service>) => {
      const res = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al actualizar servicio");
      const updated = await res.json();
      await fetchServices();
      return updated as Service;
    },
    [fetchServices],
  );

  const remove = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar servicio");
      await fetchServices();
    },
    [fetchServices],
  );

  return {
    services: filtered,
    loading,
    error,
    filter,
    setFilter,
    categories,
    create,
    update,
    remove,
  };
}
