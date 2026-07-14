"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

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
  create: (data: Partial<InventoryItem>) => Promise<void>;
  update: (id: string, data: Partial<InventoryItem>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useInventory(): UseInventoryReturn {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<InventoryType | "all">("all");

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory");
      if (!res.ok) throw new Error("Error al cargar inventario");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.type === filter);
  }, [items, filter]);

  const lowStock = useMemo(
    () => items.filter((i) => i.stockQty <= i.minStock),
    [items],
  );

  const create = useCallback(
    async (data: Partial<InventoryItem>) => {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al crear producto");
      await fetchItems();
    },
    [fetchItems],
  );

  const update = useCallback(
    async (id: string, data: Partial<InventoryItem>) => {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al actualizar producto");
      await fetchItems();
    },
    [fetchItems],
  );

  const remove = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar producto");
      await fetchItems();
    },
    [fetchItems],
  );

  return {
    items: filtered,
    lowStock,
    loading,
    error,
    filter,
    setFilter,
    total: items.length,
    lowStockCount: lowStock.length,
    create,
    update,
    remove,
  };
}
