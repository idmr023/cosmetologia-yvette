"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { ReviewForm } from "@/components/reviews/ReviewForm";

export default function ReviewPage() {
  const params = useParams();
  const appointmentId = params.appointmentId as string;

  const [appointment, setAppointment] = useState<{
    id: string;
    clientId: string;
    colaboradorId: string;
    serviceId?: string;
    clientName: string;
    serviceName: string;
    colaboradorName: string;
    startAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/appointments/public?id=${appointmentId}`)
      .then((r) => r.json())
      .then((data) => {
        setAppointment({
          id: data.id,
          clientId: data.client?.id ?? data.clientId,
          colaboradorId: data.colaborador.id,
          serviceId: data.services?.[0]?.service?.id,
          clientName: data.client?.firstName ?? "Cliente",
          serviceName: data.services?.[0]?.service?.name ?? "Servicio",
          colaboradorName: data.colaborador.fullName,
          startAt: data.startAt,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pastel/20">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pastel/20 px-4 py-8">
      <div className="mx-auto max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-ink">Tu opinión importa</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Ayúdanos a mejorar calificando tu experiencia
          </p>
        </div>

        {appointment && !done && (
          <div className="space-y-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Servicio:</span>
                <span className="font-medium text-ink">{appointment.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Especialista:</span>
                <span className="font-medium text-ink">{appointment.colaboradorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Fecha:</span>
                <span className="font-medium text-ink">
                  {new Date(appointment.startAt).toLocaleDateString("es-PE")}
                </span>
              </div>
            </div>

            <ReviewForm
              appointmentId={appointment.id}
              clientId={appointment.clientId}
              colaboradorId={appointment.colaboradorId}
              serviceId={appointment.serviceId}
              onSuccess={() => setDone(true)}
            />
          </div>
        )}

        {done && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-14 w-14 text-green-600" />
            <h2 className="text-lg font-semibold text-ink">Gracias por tu reseña</h2>
            <p className="text-sm text-neutral-500">
              Tu opinión nos ayuda a brindar un mejor servicio
            </p>
          </div>
        )}

        {!appointment && !loading && (
          <p className="text-center text-sm text-neutral-500">
            Cita no encontrada
          </p>
        )}
      </div>
    </div>
  );
}
