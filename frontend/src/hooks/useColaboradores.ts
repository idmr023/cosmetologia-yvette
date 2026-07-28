"use client";

import { useCrud } from "@/hooks/useCrud";

export interface Colaborador {
  id: string;
  userId: string | null;
  fullName: string;
  phone: string | null;
  specialty: string | null;
  commissionPct: string | null;
  isAvailable: boolean;
  colorTag: string | null;
}

interface UseColaboradoresReturn {
  colaboradores: Colaborador[];
  loading: boolean;
  error: string | null;
  create: (data: Record<string, unknown>) => Promise<Colaborador & { email: string; tempPass: string }>;
  update: (id: string, data: Record<string, unknown>) => Promise<Colaborador>;
  remove: (id: string) => Promise<void>;
}

export function useColaboradores(): UseColaboradoresReturn {
  const crud = useCrud<Colaborador>("/api/colaboradores");

  return {
    colaboradores: crud.data,
    loading: crud.loading,
    error: crud.error,
    create: crud.create as UseColaboradoresReturn["create"],
    update: crud.update,
    remove: crud.remove,
  };
}
