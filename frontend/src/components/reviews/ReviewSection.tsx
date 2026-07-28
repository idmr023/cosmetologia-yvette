"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, MessageCircle } from "lucide-react";
import { ReviewCard } from "./ReviewCard";
import { FilterChips } from "@/components/ui/FilterChips";
import { cn } from "@/lib/utils";

interface ReviewItem {
  id: string;
  clientName: string;
  colaboradorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface ReviewStats {
  average: string;
  total: number;
}

const RATING_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "5", label: "5 ★" },
  { value: "4", label: "4 ★" },
  { value: "3", label: "3 ★" },
  { value: "2", label: "2 ★" },
  { value: "1", label: "1 ★" },
];

export function ReviewSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ average: "0.0", total: 0 });
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<string>("all");

  useEffect(() => {
    const url = filterRating !== "all"
      ? `/api/reviews?rating=${filterRating}`
      : "/api/reviews";

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.data ?? []);
        setStats(data.stats ?? { average: "0.0", total: 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterRating]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2 text-sm font-medium text-gold">
            <MessageCircle className="h-4 w-4" /> Reseñas
          </div>
          <h2 className="mb-2 text-2xl font-bold text-ink md:text-3xl">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-sm text-neutral-500">
            {stats.total} reseñas · {stats.average} calificación promedio
          </p>

          {/* Overall rating */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const avg = parseFloat(stats.average);
                return (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= Math.round(avg) ? "fill-gold text-gold" : "fill-none text-neutral-300",
                    )}
                  />
                );
              })}
            </div>
            <span className="text-2xl font-bold text-ink">{stats.average}</span>
          </div>

          {/* Filter chips */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <FilterChips options={RATING_OPTIONS} value={filterRating} onChange={setFilterRating} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 9).map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </div>
      </div>
    </section>
  );
}
