"use client";

import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  clientName: string;
  colaboradorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export function ReviewCard({ clientName, colaboradorName, rating, comment, createdAt }: ReviewCardProps) {
  const date = new Date(createdAt).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:border-gold/30">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pastel/50 text-sm font-semibold text-gold">
            {clientName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{clientName}</p>
            <p className="text-xs text-neutral-400">{colaboradorName}</p>
          </div>
        </div>
        <span className="text-xs text-neutral-400">{date}</span>
      </div>

      <div className="mb-2 flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating ? "fill-gold text-gold" : "fill-none text-neutral-300",
            )}
          />
        ))}
      </div>

      {comment && (
        <div className="relative">
          <Quote className="absolute -left-1 -top-1 h-4 w-4 text-gold/30" />
          <p className="pl-3 text-sm leading-relaxed text-neutral-600">{comment}</p>
        </div>
      )}
    </div>
  );
}
