"use client";

import { useState } from "react";
import { AlertTriangle, Plus, Loader2 } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet, useSheetStore } from "@/components/ui/Sheet";
import { ConfirmDelete } from "@/components/modals/ConfirmDelete";
import { InventoryForm } from "@/components/modals/InventoryForm";
import { InventoryCard } from "@/components/cards/InventoryCard";
import { useInventory, type InventoryType, type InventoryItem } from "@/hooks/useInventory";
import { cn } from "@/lib/utils";

const FILTERS: { value: InventoryType | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "uso", label: "Uso interno" },
  { value: "venta", label: "Venta" },
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

  async function handleSave(
    data: { name: string; type: "uso" | "venta"; category: string; stockQty: number; minStock: number; unitPrice: string; supplier: string },
    id?: string,
  ) {
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
      <TopBar title="Inventario" />

      <div className="mx-auto max-w-2xl space-y-4 p-4 md:max-w-4xl">
        <Button fullWidth size="lg" onClick={openCreate}>
          <Plus className="h-5 w-5" />
          Nuevo producto
        </Button>

        {lowStockCount > 0 && (
          <Card className="flex items-center gap-3 border-red-200 bg-red-50">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">
              {lowStockCount} producto{lowStockCount > 1 ? "s" : ""} con stock bajo
            </p>
          </Card>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "min-h-touch whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors",
                filter === f.value
                  ? "bg-ink text-white"
                  : "border border-neutral-200 text-neutral-600 hover:border-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white py-8 text-center text-sm text-neutral-400">
            No hay productos en este filtro
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onEdit={() => openEdit(item)}
                onRestock={() => openRestock(item)}
                onDelete={() => setDeleting(item)}
              />
            ))}
          </div>
        )}
      </div>

      <Sheet />

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 pb-12 md:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <ConfirmDelete
              title="Eliminar producto"
              message={`¿Eliminar "${deleting.name}"? Esta acción no se puede deshacer.`}
              onConfirm={handleDelete}
              onCancel={() => setDeleting(null)}
              loading={confirmLoading}
            />
          </div>
        </div>
      )}
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
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Agregar"}
        </Button>
      </div>
    </form>
  );
}
