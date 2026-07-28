"use client";

import { useEffect, useState } from "react";
import { Star, Edit3 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { InfoCard } from "@/components/ui/InfoCard";
import { Sheet, useSheetStore } from "@/components/ui/Sheet";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { formatDate } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  colaboradorName: string;
}

interface EligibleAppointment {
  id: string;
  startAt: string;
  colaboradorId: string;
  colaboradorName: string;
  serviceName: string;
  serviceId: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating
              ? "fill-gold text-gold"
              : "fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700"
          }`}
        />
      ))}
    </div>
  );
}

export default function ClienteResenasPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligible, setEligible] = useState<EligibleAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useSheetStore();

  async function loadData() {
    const [reviewsRes, eligibleRes] = await Promise.all([
      apiFetch("/api/reviews/mine"),
      apiFetch("/api/reviews/eligible"),
    ]);
    const reviewsData = await reviewsRes.json();
    const eligibleData = await eligibleRes.json();
    setReviews(reviewsData.data ?? []);
    setEligible(eligibleData.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function openReviewForm(apt: EligibleAppointment) {
    show(
      <ReviewForm
        appointmentId={apt.id}
        colaboradorId={apt.colaboradorId}
        serviceId={apt.serviceId}
        onSuccess={() => {
          useSheetStore.getState().close();
          setEligible((prev) => prev.filter((e) => e.id !== apt.id));
          apiFetch("/api/reviews/mine")
            .then((r) => r.json())
            .then((data) => setReviews(data.data ?? []))
            .catch(() => {});
        }}
      />,
    );
  }

  const hasEligible = eligible.length > 0;
  const hasReviews = reviews.length > 0;
  const empty = !hasEligible && !hasReviews && !loading;

  return (
    <>
      <TopBar title="Mis Reseñas" />
      <Sheet />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <InfoCard icon={Star}>
          <p className="text-sm text-neutral-600">
            <strong className="text-ink">{reviews.length}</strong> reseñas
            escritas
          </p>
        </InfoCard>

        {loading ? (
          <LoadingSpinner />
        ) : empty ? (
          <EmptyState message="Consume tu primer producto para dejar una reseña" />
        ) : (
          <>
            {hasEligible && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-ink">Esperando tu reseña</h2>
                {eligible.map((apt) => (
                  <Card key={apt.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">{apt.serviceName}</p>
                        <p className="text-xs text-neutral-500">
                          con {apt.colaboradorName}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {formatDate(new Date(apt.startAt))}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openReviewForm(apt)}
                        className="shrink-0"
                      >
                        <Edit3 className="mr-1 h-4 w-4" />
                        Reseñar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {hasReviews && (
              <div className="flex flex-col gap-3">
                {hasEligible && (
                  <h2 className="text-sm font-semibold text-ink">Tus reseñas</h2>
                )}
                {reviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <StarRating rating={review.rating} />
                      <p className="text-xs text-neutral-500">
                        {formatDate(new Date(review.createdAt))}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Con: {review.colaboradorName}
                    </p>
                    {review.comment && (
                      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                        {review.comment}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
