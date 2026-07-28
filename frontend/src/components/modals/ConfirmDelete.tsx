"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmDeleteProps {
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDelete({
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: ConfirmDeleteProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-7 w-7 text-red-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-neutral-500">{message}</p>
      </div>
      <div className="flex w-full gap-3">
        <Button onClick={onCancel} variant="outline" fullWidth disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="danger" fullWidth disabled={loading}>
          {loading ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>
    </div>
  );
}
