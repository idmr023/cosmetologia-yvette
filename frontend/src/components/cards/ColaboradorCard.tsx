"use client";

import { Phone, Pencil, Trash2, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DataCard } from "@/components/ui/DataCard";
import type { Colaborador } from "@/hooks/useColaboradores";

interface ColaboradorCardProps {
  colaborador: Colaborador;
  onEdit?: (col: Colaborador) => void;
  onDelete?: (col: Colaborador) => void;
}

export function ColaboradorCard({ colaborador, onEdit, onDelete }: ColaboradorCardProps) {
  return (
    <DataCard
      header={{
        title: colaborador.fullName,
        subtitle: colaborador.specialty ?? undefined,
      }}
      menu={
        onEdit || onDelete
          ? [
              ...(onEdit ? [{ label: "Editar", icon: Pencil, onClick: () => onEdit(colaborador) }] : []),
              ...(onDelete ? [{ label: "Eliminar", icon: Trash2, danger: true as const, onClick: () => onDelete(colaborador) }] : []),
            ]
          : undefined
      }
      headerRight={
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{ backgroundColor: colaborador.colorTag ?? "#C9A227" }}
        >
          {colaborador.fullName.charAt(0)}
        </div>
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {colaborador.phone && (
            <a
              href={`https://wa.me/${colaborador.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-gold"
            >
              <Phone className="h-3.5 w-3.5" />
              {colaborador.phone}
            </a>
          )}
        </div>
        <Badge variant={colaborador.isAvailable ? "success" : "neutral"}>
          {colaborador.isAvailable ? (
            <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Disponible</span>
          ) : (
            <span className="flex items-center gap-1"><X className="h-3 w-3" /> No disponible</span>
          )}
        </Badge>
      </div>

      {colaborador.commissionPct && Number(colaborador.commissionPct) > 0 && (
        <div className="flex items-center gap-1.5 border-t border-neutral-100 pt-2 text-sm text-neutral-500">
          Comisión: <span className="font-medium text-ink">{colaborador.commissionPct}%</span>
        </div>
      )}
    </DataCard>
  );
}
