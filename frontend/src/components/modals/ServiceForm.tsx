"use client";

import { Save, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { serviceSchema, type ServiceFormData } from "@/lib/schemas";

interface ServiceFormProps {
  initial?: {
    name: string;
    category: string;
    durationMin: number;
    price: string;
    description: string | null;
    isActive: boolean;
  };
  onSave: (data: ServiceFormData & { description: string | null }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CATEGORIES = [
  "Peluquería",
  "Tratamiento Capilar",
  "Color",
  "Laceado",
  "Estética Facial",
  "Depilación",
  "Paquetes",
];

export function ServiceForm({ initial, onSave, onCancel, loading }: ServiceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initial?.name ?? "",
      category: initial?.category ?? CATEGORIES[0],
      durationMin: initial?.durationMin ?? 60,
      price: initial ? Number(initial.price) : undefined,
      description: initial?.description ?? "",
      isActive: initial?.isActive ?? true,
    },
  });

  async function onSubmit(data: ServiceFormData) {
    await onSave({ ...data, description: data.description ?? null });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-ink">
        {initial ? "Editar servicio" : "Nuevo servicio"}
      </h2>

      <Input
        id="s-name"
        label="Nombre del servicio"
        placeholder="Ej: Corte de cabello"
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Categoría</label>
        <select
          {...register("category")}
          className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.category && (
          <p className="text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="s-duration"
          label="Duración (min)"
          type="number"
          min={5}
          step={5}
          error={errors.durationMin?.message}
          {...register("durationMin")}
        />
        <Input
          id="s-price"
          label="Precio (S/)"
          type="number"
          min="0"
          step="0.5"
          placeholder="0.00"
          error={errors.price?.message}
          {...register("price")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Descripción</label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Descripción opcional del servicio..."
          className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-base text-ink placeholder:text-neutral-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </div>

      <label className="flex min-h-touch items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
        <input
          type="checkbox"
          {...register("isActive")}
          className="h-5 w-5 rounded border-neutral-300 text-gold focus:ring-gold"
        />
        <span className="text-sm text-neutral-700">Servicio activo</span>
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="button" onClick={onCancel} variant="outline" fullWidth disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {initial ? "Guardar cambios" : "Crear servicio"}
        </Button>
      </div>
    </form>
  );
}
