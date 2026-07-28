"use client";

import { useState } from "react";
import { Star, MessageCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  appointmentId: string;
  clientId?: string;
  colaboradorId: string;
  serviceId?: string;
  onSuccess?: () => void;
}

export function ReviewForm({ appointmentId, clientId, colaboradorId, serviceId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (rating === 0) {
      setError("Selecciona una calificación");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        appointmentId,
        colaboradorId,
        rating,
      };
      if (clientId) body.clientId = clientId;
      if (serviceId) body.serviceId = serviceId;
      if (comment.trim()) body.comment = comment.trim();

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess?.();
      } else {
        const data = await res.json();
        setError(data.error ?? "Error al enviar reseña");
      }
    } catch {
      setError("Error de conexión");
    }

    setSubmitting(false);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <MessageCircle className="h-5 w-5 text-gold" />
        Califica tu experiencia
      </div>

      {/* Estrellas */}
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="min-h-touch min-w-touch flex items-center justify-center p-1"
          >
            <Star
              className={cn(
                "h-8 w-8 transition-all",
                (hoverRating || rating) >= star
                  ? "fill-gold text-gold"
                  : "fill-none text-neutral-300",
              )}
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <p className="text-center text-sm text-neutral-500">
          {rating === 1 && "Malo"}
          {rating === 2 && "Regular"}
          {rating === 3 && "Bueno"}
          {rating === 4 && "Muy bueno"}
          {rating === 5 && "Excelente"}
        </p>
      )}

      {/* Comentario */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Cuéntanos cómo te fue (opcional)"
        maxLength={500}
        rows={3}
        className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-base text-ink placeholder:text-neutral-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
      />
      <p className="text-right text-xs text-neutral-400">{comment.length}/500</p>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <Button onClick={handleSubmit} size="lg" fullWidth disabled={submitting || rating === 0}>
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Send className="h-4 w-4" /> Enviar reseña
          </>
        )}
      </Button>
    </div>
  );
}
