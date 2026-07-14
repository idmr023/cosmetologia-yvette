"use client";

import { useState } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Button } from "@/components/ui/Button";
import { Sheet, useSheetStore } from "@/components/ui/Sheet";
import { ConfirmDelete } from "@/components/modals/ConfirmDelete";
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
          phone: client.phone,
          email: client.email ?? "",
          notes: client.notes ?? "",
        }}
        onSave={(data) => handleSave(data, client.id)}
        onCancel={sheet.close}
      />,
    );
  }

  async function handleSave(data: { firstName: string; lastName: string; phone: string; email: string; notes: string }, id?: string) {
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
      <TopBar title="Clientes" />

      <div className="mx-auto max-w-2xl space-y-4 p-4 md:max-w-4xl">
        <Button fullWidth size="lg" onClick={openCreate}>
          <Plus className="h-5 w-5" />
          Nuevo cliente
        </Button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            inputMode="search"
            placeholder="Buscar por nombre o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-4 text-base text-ink placeholder:text-neutral-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <p className="text-sm text-neutral-400">
          {clients.length} de {total} clientes
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white py-8 text-center text-sm text-neutral-400">
            No se encontraron clientes
          </div>
        ) : (
          <div className="flex flex-col gap-3">
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
          </div>
        )}
      </div>

      <Sheet />

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 pb-12 md:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <ConfirmDelete
              title="Eliminar cliente"
              message={`¿Eliminar a "${deleting.firstName} ${deleting.lastName}"? Se perderán sus datos y citas.`}
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
