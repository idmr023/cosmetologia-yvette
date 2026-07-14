"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface InventoryFormProps {
  initial?: {
    name: string;
    type: "uso" | "venta";
    category: string;
    stockQty: number;
    minStock: number;
    unitPrice: string;
    supplier: string;
  };
  onSave: (data: {
    name: string;
    type: "uso" | "venta";
    category: string;
    stockQty: number;
    minStock: number;
    unitPrice: string;
    supplier: string;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function InventoryForm({ initial, onSave, onCancel, loading }: InventoryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<"uso" | "venta">(initial?.type ?? "uso");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [stockQty, setStockQty] = useState(String(initial?.stockQty ?? "0"));
  const [minStock, setMinStock] = useState(String(initial?.minStock ?? "0"));
  const [unitPrice, setUnitPrice] = useState(initial?.unitPrice ?? "");
  const [supplier, setSupplier] = useState(initial?.supplier ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave({
      name: name.trim(),
      type,
      category: category.trim(),
      stockQty: Number(stockQty),
      minStock: Number(minStock),
      unitPrice,
      supplier: supplier.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-ink">
        {initial ? "Editar producto" : "Nuevo producto"}
      </h2>

      <Input
        id="i-name"
        label="Nombre del producto"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej: Shampoo profesional"
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Tipo</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("uso")}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              type === "uso"
                ? "border-gold bg-gold/5 text-ink ring-2 ring-gold/20"
                : "border-neutral-200 text-neutral-600 hover:border-gold/30"
            }`}
          >
            Uso interno
          </button>
          <button
            type="button"
            onClick={() => setType("venta")}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              type === "venta"
                ? "border-gold bg-gold/5 text-ink ring-2 ring-gold/20"
                : "border-neutral-200 text-neutral-600 hover:border-gold/30"
            }`}
          >
            Venta
          </button>
        </div>
      </div>

      <Input
        id="i-category"
        label="Categoría"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Ej: Cuidado capilar"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="i-stock"
          label="Stock actual"
          type="number"
          min="0"
          value={stockQty}
          onChange={(e) => setStockQty(e.target.value)}
          required
        />
        <Input
          id="i-minstock"
          label="Stock mínimo"
          type="number"
          min="0"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          required
        />
      </div>

      <Input
        id="i-price"
        label="Precio unitario (S/)"
        type="number"
        min="0"
        step="0.5"
        value={unitPrice}
        onChange={(e) => setUnitPrice(e.target.value)}
        placeholder="0.00"
      />

      <Input
        id="i-supplier"
        label="Proveedor"
        value={supplier}
        onChange={(e) => setSupplier(e.target.value)}
        placeholder="Nombre del proveedor"
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" onClick={onCancel} variant="outline" fullWidth disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" fullWidth disabled={loading || !name.trim()}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {initial ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
