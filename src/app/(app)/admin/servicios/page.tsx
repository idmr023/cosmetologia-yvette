"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Scissors } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DataCard } from "@/components/ui/DataCard";
import { PageShell } from "@/components/ui/PageShell";
import { FilterChips } from "@/components/ui/FilterChips";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSheetStore } from "@/components/ui/Sheet";
import { ServiceForm } from "@/components/modals/ServiceForm";
import { useServices, type Service } from "@/hooks/useServices";
import { formatCurrency } from "@/lib/utils";

export default function ServiciosPage() {
  const { services, loading, categories, filter, setFilter, create, update, remove } = useServices();
  const sheet = useSheetStore();
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const filterOptions = [
    { value: "all", label: "Todos" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

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

  async function handleSave(data: Record<string, unknown>, id?: string) {
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
      <PageShell
        title="Servicios"
        action={{ label: "Nuevo servicio", icon: Plus, onClick: openCreate }}
        filters={<FilterChips options={filterOptions} value={filter} onChange={setFilter} />}
        loading={loading}
        empty={services.length === 0}
        emptyMessage="No hay servicios en esta categoría"
      >
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onEdit={() => openEdit(service)}
            onDelete={() => setDeleting(service)}
          />
        ))}
      </PageShell>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar servicio"
        message={`¿Eliminar "${deleting?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={confirmLoading}
      />
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
    <DataCard
      header={{
        icon: Scissors,
        title: service.name,
        subtitle: service.category,
      }}
      headerRight={
        <Badge variant={service.isActive ? "success" : "neutral"}>
          {service.isActive ? "Activo" : "Inactivo"}
        </Badge>
      }
      menu={[
        { label: "Editar", icon: Pencil, onClick: onEdit },
        { label: "Eliminar", icon: Trash2, danger: true as const, onClick: onDelete },
      ]}
    >
      <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
        <span className="text-sm text-neutral-500">{service.durationMin} min</span>
        <span className="text-sm font-semibold text-gold">{formatCurrency(service.price)}</span>
      </div>
    </DataCard>
  );
}
