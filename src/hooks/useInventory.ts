"use client";

import { useState, useMemo } from "react";
import { useCrud } from "@/hooks/useCrud";

export type InventoryType = "uso" | "venta";

export interface InventoryItem {
  id: string;
  name: string;
  type: InventoryType;
  category: string | null;
  stockQty: number;
  minStock: number;
  unitPrice: string | null;
  supplier: string | null;
}

interface UseInventoryReturn {
  items: InventoryItem[];
  lowStock: InventoryItem[];
  loading: boolean;
  error: string | null;
  filter: InventoryType | "all";
  setFilter: (v: InventoryType | "all") => void;
  total: number;
  lowStockCount: number;
  create: (data: Record<string, unknown>) => Promise<void>;
  update: (id: string, data: Record<string, unknown>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useInventory(): UseInventoryReturn {
  const crud = useCrud<InventoryItem>("/api/inventory");
  const [filter, setFilter] = useState<InventoryType | "all">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return crud.data;
    return crud.data.filter((i) => i.type === filter);
  }, [crud.data, filter]);

  const lowStock = useMemo(
    () => crud.data.filter((i) => i.stockQty <= i.minStock),
    [crud.data],
  );

  return {
    items: filtered,
    lowStock,
    loading: crud.loading,
    error: crud.error,
    filter,
    setFilter,
    total: crud.data.length,
    lowStockCount: lowStock.length,
    create: crud.create as unknown as UseInventoryReturn["create"],
    update: crud.update as unknown as UseInventoryReturn["update"],
    remove: crud.remove,
  };
}
