"use client";

import { AlertTriangle, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DataCard } from "@/components/ui/DataCard";
import { formatCurrency } from "@/lib/utils";
import type { InventoryItem } from "@/hooks/useInventory";

interface InventoryCardProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
  onRestock?: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
}

export function InventoryCard({
  item,
  onEdit,
  onRestock,
  onDelete,
}: InventoryCardProps) {
  const low = item.stockQty <= item.minStock;

  return (
    <DataCard
      header={{
        icon: Package,
        title: item.name,
        subtitle: item.category ?? undefined,
      }}
      menu={
        onEdit || onRestock || onDelete
          ? [
              ...(onEdit ? [{ label: "Editar", icon: Pencil, onClick: () => onEdit(item) }] : []),
              ...(onRestock ? [{ label: "Agregar stock", icon: Plus, onClick: () => onRestock(item) }] : []),
              ...(onDelete ? [{ label: "Eliminar", icon: Trash2, danger: true as const, onClick: () => onDelete(item) }] : []),
            ]
          : undefined
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">Stock:</span>
          <span className={low ? "text-base font-bold text-red-600" : "text-base font-bold text-ink"}>
            {item.stockQty}
          </span>
          <span className="text-sm text-neutral-400">/ mín {item.minStock}</span>
        </div>
        <Badge variant={item.type === "venta" ? "gold" : "neutral"}>
          {item.type === "venta" ? "Venta" : "Uso interno"}
        </Badge>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
        {item.unitPrice ? (
          <span className="text-sm font-medium text-neutral-600">
            {formatCurrency(item.unitPrice)}
          </span>
        ) : (
          <span className="text-sm text-neutral-400">—</span>
        )}
        {low && (
          <span className="flex items-center gap-1 text-xs font-medium text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            Stock bajo
          </span>
        )}
      </div>
    </DataCard>
  );
}
