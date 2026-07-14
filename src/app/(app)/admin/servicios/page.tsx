"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Scissors } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThreeDotMenu } from "@/components/ui/ThreeDotMenu";
import { Sheet, useSheetStore } from "@/components/ui/Sheet";
import { ConfirmDelete } from "@/components/modals/ConfirmDelete";
import { ServiceForm } from "@/components/modals/ServiceForm";
import { useServices, type Service } from "@/hooks/useServices";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ServiciosPage() {
  const { services, loading, categories, filter, setFilter, create, update, remove } = useServices();
  const sheet = useSheetStore();
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  function openCreate() {
    sheet.show(<ServiceForm onSave={handleSave} onCancel={sheet.close} />);
  }

  function openEdit(service: Service) {
    sheet.show(
      <ServiceForm
        initial={service}
        onSave={(data) => handleSave(data, service.id)}
        onCancel={sheet.close}
      />,
    );
  }

  async function handleSave(data: { name: string; category: string; durationMin: number; price: number; description: string | null; isActive: boolean }, id?: string) {
    try {
      const payload = { ...data, price: String(data.price) };
      if (id) {
        await update(id, payload);
      } else {
        await create(payload);
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
      <TopBar title="Servicios" />

      <div className="mx-auto max-w-2xl space-y-4 p-4 md:max-w-4xl">
        <Button fullWidth size="lg" onClick={openCreate}>
          <Plus className="h-5 w-5" />
          Nuevo servicio
        </Button>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "min-h-touch whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors",
              filter === "all"
                ? "bg-ink text-white"
                : "border border-neutral-200 text-neutral-600 hover:border-ink",
            )}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "min-h-touch whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors",
                filter === cat
                  ? "bg-ink text-white"
                  : "border border-neutral-200 text-neutral-600 hover:border-ink",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white py-8 text-center text-sm text-neutral-400">
            No hay servicios en esta categoría
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={() => openEdit(service)}
                onDelete={() => setDeleting(service)}
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
              title="Eliminar servicio"
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

interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
}

function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Scissors className="h-4 w-4 text-neutral-400" />
            <h3 className="text-base font-semibold text-ink">{service.name}</h3>
          </div>
          <p className="text-sm text-neutral-500">{service.category}</p>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant={service.isActive ? "success" : "neutral"}>
            {service.isActive ? "Activo" : "Inactivo"}
          </Badge>
          <ThreeDotMenu
            items={[
              { label: "Editar", icon: Pencil, onClick: onEdit },
              { label: "Eliminar", icon: Trash2, danger: true, onClick: onDelete },
            ]}
          />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
        <span className="text-sm text-neutral-500">{service.durationMin} min</span>
        <span className="text-sm font-semibold text-gold">{formatCurrency(service.price)}</span>
      </div>
    </Card>
  );
}
