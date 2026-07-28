"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSheetStore } from "@/components/ui/Sheet";
import { ColaboradorForm } from "@/components/modals/ColaboradorForm";
import { ColaboradorCard } from "@/components/cards/ColaboradorCard";
import { useColaboradores, type Colaborador } from "@/hooks/useColaboradores";

export default function ColaboradoresPage() {
  const { colaboradores, loading, create, update, remove } = useColaboradores();
  const sheet = useSheetStore();
  const [deleting, setDeleting] = useState<Colaborador | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; tempPass: string } | null>(null);

  function openCreate() {
    setCreatedCreds(null);
    sheet.show(
      <ColaboradorForm
        createdCredentials={createdCreds}
        onSave={handleSave}
        onCancel={sheet.close}
      />,
    );
  }

  function openEdit(col: Colaborador) {
    setCreatedCreds(null);
    sheet.show(
      <ColaboradorForm
        initial={{
          fullName: col.fullName,
          phone: col.phone ?? "",
          specialty: col.specialty ?? "",
          commissionPct: col.commissionPct ?? "0",
          isAvailable: col.isAvailable,
          colorTag: col.colorTag ?? "#C9A227",
        }}
        onSave={(data) => handleSave(data, col.id)}
        onCancel={sheet.close}
      />,
    );
  }

  async function handleSave(data: Record<string, unknown>, id?: string) {
    try {
      if (id) {
        await update(id, data);
        sheet.close();
      } else {
        const result = await create(data);
        setCreatedCreds({ email: result.email, tempPass: result.tempPass });
      }
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
        title="Colaboradoras"
        action={{ label: "Nueva colaboradora", icon: Plus, onClick: openCreate }}
        loading={loading}
        empty={colaboradores.length === 0}
        emptyMessage="No hay colaboradoras registradas"
      >
        {colaboradores.map((col) => (
          <ColaboradorCard
            key={col.id}
            colaborador={col}
            onEdit={() => openEdit(col)}
            onDelete={() => setDeleting(col)}
          />
        ))}
      </PageShell>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar colaboradora"
        message={`¿Eliminar a "${deleting?.fullName}"? También se eliminará su cuenta de usuario.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={confirmLoading}
      />
    </>
  );
}
