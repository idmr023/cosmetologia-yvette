"use client";

import { Phone, CalendarPlus, Pencil, Trash2, Eye, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThreeDotMenu } from "@/components/ui/ThreeDotMenu";
import { formatDate, whatsappLink } from "@/lib/utils";
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
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold text-ink">{fullName}</h3>
          <a
            href={whatsappLink(client.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-neutral-500"
          >
            <Phone className="h-3.5 w-3.5" />
            {client.phone}
          </a>
        </div>
        <ThreeDotMenu
          items={[
            { label: "Ver detalle", icon: Eye, onClick: () => onView?.(client) },
            { label: "Editar", icon: Pencil, onClick: () => onEdit?.(client) },
            {
              label: "Eliminar",
              icon: Trash2,
              danger: true,
              onClick: () => onDelete?.(client),
            },
          ]}
        />
      </div>

      <div className="flex gap-2">
        {client.email && (
          <Badge variant="neutral">{client.email}</Badge>
        )}
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
    </Card>
  );
}
