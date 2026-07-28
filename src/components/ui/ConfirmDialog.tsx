"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 pb-12 md:items-center">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-ink dark:text-white">{title}</h3>
          <p className="text-sm text-neutral-500">{message}</p>
        </div>
        <div className="mt-5 flex gap-3">
          <Button onClick={onCancel} variant="outline" fullWidth disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} variant="danger" fullWidth disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
