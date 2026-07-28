"use client";

import { useState, useMemo } from "react";
import { useCrud } from "@/hooks/useCrud";

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
  create: (data: Record<string, unknown>) => Promise<Service>;
  update: (id: string, data: Record<string, unknown>) => Promise<Service>;
  remove: (id: string) => Promise<void>;
}

export function useServices(): UseServicesReturn {
  const crud = useCrud<Service>("/api/services");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return crud.data;
    return crud.data.filter((s) => s.category === filter);
  }, [crud.data, filter]);

  const categories = useMemo(() => {
    return Array.from(new Set(crud.data.map((s) => s.category))).sort();
  }, [crud.data]);

  return {
    services: filtered,
    loading: crud.loading,
    error: crud.error,
    filter,
    setFilter,
    categories,
    create: crud.create as UseServicesReturn["create"],
    update: crud.update as UseServicesReturn["update"],
    remove: crud.remove,
  };
}
