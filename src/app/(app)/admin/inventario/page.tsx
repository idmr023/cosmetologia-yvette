"use client";

import { useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/ui/PageShell";
import { FilterChips } from "@/components/ui/FilterChips";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSheetStore } from "@/components/ui/Sheet";
import { InventoryForm } from "@/components/modals/InventoryForm";
import { InventoryCard } from "@/components/cards/InventoryCard";
import { useInventory, type InventoryType, type InventoryItem } from "@/hooks/useInventory";

const FILTERS = [
  { value: "all" as const, label: "Todos" },
  { value: "uso" as const, label: "Uso interno" },
  { value: "venta" as const, label: "Venta" },
];

export default function InventarioPage() {
  const { items, lowStockCount, filter, setFilter, loading, create, update, remove } = useInventory();
  const sheet = useSheetStore();
  const [deleting, setDeleting] = useState<InventoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  function openCreate() {
    sheet.show(<InventoryForm onSave={handleSave} onCancel={sheet.close} />);
  }

  function openEdit(item: InventoryItem) {
    sheet.show(
      <InventoryForm
        initial={{
          name: item.name,
          type: item.type,
          category: item.category ?? "",
          stockQty: item.stockQty,
          minStock: item.minStock,
          unitPrice: item.unitPrice ?? "",
          supplier: item.supplier ?? "",
        }}
        onSave={(data) => handleSave(data, item.id)}
        onCancel={sheet.close}
      />,
    );
  }

  function openRestock(item: InventoryItem) {
    sheet.show(
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink">Agregar stock</h2>
        <p className="text-sm text-neutral-500">
          Stock actual de <strong>{item.name}</strong>: {item.stockQty}
        </p>
        <RestockForm
          onSave={async (qty) => {
            setSaving(true);
            try {
              await update(item.id, { stockQty: item.stockQty + qty });
              sheet.close();
            } catch {
              // error handled by hook
            }
            setSaving(false);
          }}
          onCancel={sheet.close}
          loading={saving}
        />
      </div>,
    );
  }

  async function handleSave(data: Record<string, unknown>, id?: string) {
    try {
      if (id) {
        await update(id, data);
      } else {
        await create(data);
      }
      sheet.close();
    } catch {
      // error handled by hook
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setConfirmLoading(true);
    try {
      await remove(deleting.id);
      setDeleting(null);
    } catch {
      // error handled by hook
    }
    setConfirmLoading(false);
  }

  return (
    <>
      <PageShell
        title="Inventario"
        action={{ label: "Nuevo producto", icon: Plus, onClick: openCreate }}
        filters={<FilterChips options={FILTERS} value={filter} onChange={(v) => setFilter(v as InventoryType | "all")} />}
        loading={loading}
        empty={items.length === 0}
        emptyMessage="No hay productos en este filtro"
      >
        {lowStockCount > 0 && (
          <Card className="flex items-center gap-3 border-red-200 bg-red-50">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">
              {lowStockCount} producto{lowStockCount > 1 ? "s" : ""} con stock bajo
            </p>
          </Card>
        )}

        {items.map((item) => (
          <InventoryCard
            key={item.id}
            item={item}
            onEdit={() => openEdit(item)}
            onRestock={() => openRestock(item)}
            onDelete={() => setDeleting(item)}
          />
        ))}
      </PageShell>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar producto"
        message={`¿Eliminar "${deleting?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={confirmLoading}
      />
    </>
  );
}

function RestockForm({
  onSave,
  onCancel,
  loading,
}: {
  onSave: (qty: number) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}) {
  const [qty, setQty] = useState("1");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (Number(qty) > 0) onSave(Number(qty));
      }}
      className="flex flex-col gap-4"
    >
      <input
        type="number"
        min="1"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        placeholder="Cantidad a agregar"
        autoFocus
      />
      <div className="flex gap-3">
        <Button type="button" onClick={onCancel} variant="outline" fullWidth disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" fullWidth disabled={loading || Number(qty) <= 0}>
          {loading ? "Agregando..." : "Agregar"}
        </Button>
      </div>
    </form>
  );
}
