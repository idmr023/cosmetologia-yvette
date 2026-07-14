"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Button } from "@/components/ui/Button";
import { Sheet, useSheetStore } from "@/components/ui/Sheet";
import { ConfirmDelete } from "@/components/modals/ConfirmDelete";
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

  async function handleSave(
    data: { fullName: string; phone: string; specialty: string; commissionPct: string; isAvailable: boolean; colorTag: string },
    id?: string,
  ) {
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
      <TopBar title="Colaboradoras" />

      <div className="mx-auto max-w-2xl space-y-4 p-4 md:max-w-4xl">
        <Button fullWidth size="lg" onClick={openCreate}>
          <Plus className="h-5 w-5" />
          Nueva colaboradora
        </Button>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : colaboradores.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white py-8 text-center text-sm text-neutral-400">
            No hay colaboradoras registradas
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {colaboradores.map((col) => (
              <ColaboradorCard
                key={col.id}
                colaborador={col}
                onEdit={() => openEdit(col)}
                onDelete={() => setDeleting(col)}
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
              title="Eliminar colaboradora"
              message={`¿Eliminar a "${deleting.fullName}"? También se eliminará su cuenta de usuario.`}
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
