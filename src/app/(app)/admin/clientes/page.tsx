"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSheetStore } from "@/components/ui/Sheet";
import { ClientForm } from "@/components/modals/ClientForm";
import { ClientHistoryModal } from "@/components/modals/ClientHistoryModal";
import { ClientCard } from "@/components/cards/ClientCard";
import { useClients, type Client } from "@/hooks/useClients";

export default function ClientesPage() {
  const { clients, search, setSearch, total, loading, create, update, remove } = useClients();
  const sheet = useSheetStore();
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  function openCreate() {
    sheet.show(<ClientForm onSave={handleSave} onCancel={sheet.close} />);
  }

  function openEdit(client: Client) {
    sheet.show(
      <ClientForm
        initial={{
          firstName: client.firstName,
          lastName: client.lastName,
          dni: client.dni,
          phone: client.phone,
          email: client.email ?? "",
          notes: client.notes ?? "",
        }}
        onSave={(data) => handleSave(data, client.id)}
        onCancel={sheet.close}
      />,
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
        title="Clientes"
        action={{ label: "Nuevo cliente", icon: Plus, onClick: openCreate }}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Buscar por nombre o teléfono...",
        }}
        loading={loading}
        empty={clients.length === 0}
        emptyMessage="No se encontraron clientes"
        count={`${clients.length} de ${total} clientes`}
      >
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onView={() => {
              sheet.show(
                <ClientHistoryModal clientId={client.id} clientName={`${client.firstName} ${client.lastName}`} />,
              );
            }}
            onEdit={() => openEdit(client)}
            onDelete={() => setDeleting(client)}
          />
        ))}
      </PageShell>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar cliente"
        message={`¿Eliminar a "${deleting?.firstName} ${deleting?.lastName}"? Se perderán sus datos y citas.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={confirmLoading}
      />
    </>
  );
}
