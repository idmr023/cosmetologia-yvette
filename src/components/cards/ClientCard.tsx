"use client";

import { CalendarPlus, Pencil, Trash2, Eye, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DataCard } from "@/components/ui/DataCard";
import { formatDate } from "@/lib/utils";
import type { Client } from "@/hooks/useClients";

interface ClientCardProps {
  client: Client;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onView?: (client: Client) => void;
}

export function ClientCard({ client, onEdit, onDelete, onView }: ClientCardProps) {
  const fullName = `${client.firstName} ${client.lastName}`;

  return (
    <DataCard
      header={{ title: fullName, subtitle: client.phone }}
      menu={
        onEdit || onDelete || onView
          ? [
              ...(onView ? [{ label: "Ver detalle", icon: Eye, onClick: () => onView(client) }] : []),
              ...(onEdit ? [{ label: "Editar", icon: Pencil, onClick: () => onEdit(client) }] : []),
              ...(onDelete ? [{ label: "Eliminar", icon: Trash2, danger: true as const, onClick: () => onDelete(client) }] : []),
            ]
          : undefined
      }
    >
      <div className="flex gap-2">
        {client.email && <Badge variant="neutral">{client.email}</Badge>}
        {client.createdAt && (
          <Badge variant="default">
            <CalendarPlus className="mr-1 h-3 w-3" />
            {formatDate(client.createdAt)}
          </Badge>
        )}
      </div>

      {client.notes && (
        <p className="flex items-start gap-1.5 rounded-lg bg-pastel/30 px-3 py-2 text-sm text-neutral-600">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
          {client.notes}
        </p>
      )}
    </DataCard>
  );
}
