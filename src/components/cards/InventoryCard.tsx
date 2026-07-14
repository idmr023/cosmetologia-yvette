"use client";

import { AlertTriangle, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThreeDotMenu } from "@/components/ui/ThreeDotMenu";
import { formatCurrency, isLowStock } from "@/lib/utils";
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
  const low = isLowStock(item.stockQty, item.minStock);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-neutral-400" />
            <h3 className="text-base font-semibold text-ink">{item.name}</h3>
          </div>
          <p className="text-sm text-neutral-500">{item.category}</p>
        </div>
        <ThreeDotMenu
          items={[
            { label: "Editar", icon: Pencil, onClick: () => onEdit?.(item) },
            {
              label: "Agregar stock",
              icon: Plus,
              onClick: () => onRestock?.(item),
            },
            {
              label: "Eliminar",
              icon: Trash2,
              danger: true,
              onClick: () => onDelete?.(item),
            },
          ]}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">Stock:</span>
          <span
            className={
              low
                ? "text-base font-bold text-red-600"
                : "text-base font-bold text-ink"
            }
          >
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
    </Card>
  );
}
