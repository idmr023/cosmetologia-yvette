"use client";

import { Phone, Pencil, Trash2, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThreeDotMenu } from "@/components/ui/ThreeDotMenu";
import type { Colaborador } from "@/hooks/useColaboradores";

interface ColaboradorCardProps {
  colaborador: Colaborador;
  onEdit?: (col: Colaborador) => void;
  onDelete?: (col: Colaborador) => void;
}

export function ColaboradorCard({ colaborador, onEdit, onDelete }: ColaboradorCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white"
            style={{ backgroundColor: colaborador.colorTag ?? "#C9A227" }}
          >
            {colaborador.fullName.charAt(0)}
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-semibold text-ink">{colaborador.fullName}</h3>
            {colaborador.specialty && (
              <p className="text-sm text-neutral-500">{colaborador.specialty}</p>
            )}
          </div>
        </div>
        <ThreeDotMenu
          items={[
            { label: "Editar", icon: Pencil, onClick: () => onEdit?.(colaborador) },
            {
              label: "Eliminar",
              icon: Trash2,
              danger: true,
              onClick: () => onDelete?.(colaborador),
            },
          ]}
        />
      </div>

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
    </Card>
  );
}
