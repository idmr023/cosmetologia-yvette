"use client";

import { useState, useEffect } from "react";
import { Star, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  clientName: string;
  colaboradorName: string;
  rating: number;
  comment: string | null;
  isPublic: boolean;
  createdAt: string;
}

interface Stats {
  average: string;
  total: number;
}

export default function ResenasPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats>({ average: "0.0", total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.data ?? []);
        setStats(data.stats ?? { average: "0.0", total: 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleDelete(id: string) {
    setDeletingId(id);
  }

  async function toggleVisibility(id: string, current: boolean) {
    const res = await fetch(`/api/reviews/${id}/toggle-visibility`, { method: "PATCH" });
    if (res.ok) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isPublic: !current } : r)));
      toast(current ? "Reseña oculta" : "Reseña visible", "success");
    } else {
      toast("Error al cambiar visibilidad", "error");
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    const res = await fetch(`/api/reviews/${deletingId}`, { method: "DELETE" });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== deletingId));
      toast("Reseña eliminada correctamente", "success");
    } else {
      toast("Error al eliminar la reseña", "error");
    }
    setDeletingId(null);
  }

  const filtered = filter ? reviews.filter((r) => r.rating === filter) : reviews;

  return (
    <>
      <TopBar title="Reseñas" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Stats */}
        <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-5 w-5",
                    star <= Math.round(parseFloat(stats.average))
                      ? "fill-gold text-gold"
                      : "fill-none text-neutral-300",
                  )}
                />
              ))}
            </div>
            <span className="text-lg font-bold text-ink">{stats.average}</span>
          </div>
          <span className="text-sm text-neutral-400">{stats.total} reseñas</span>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {[null, 5, 4, 3, 2, 1].map((r) => (
            <button
              key={r ?? "all"}
              onClick={() => setFilter(r)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === r
                  ? "bg-gold text-white"
                  : "border border-neutral-200 bg-white text-neutral-600",
              )}
            >
              {r === null ? "Todas" : `${r} ★`}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">
            No hay reseñas
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{review.clientName}</p>
                    <p className="text-xs text-neutral-400">{review.colaboradorName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVisibility(review.id, review.isPublic)}
                      className="flex min-h-touch min-w-touch items-center gap-1 rounded-lg p-1 text-xs font-medium"
                    >
                      {review.isPublic ? (
                        <><Eye className="h-4 w-4 text-green-600" /><span className="text-green-600">Visible</span></>
                      ) : (
                        <><EyeOff className="h-4 w-4 text-neutral-400" /><span className="text-neutral-400">Oculta</span></>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="min-h-touch min-w-touch rounded-lg p-1 text-neutral-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-2 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-4 w-4",
                        star <= review.rating ? "fill-gold text-gold" : "fill-none text-neutral-300",
                      )}
                    />
                  ))}
                </div>

                {review.comment && (
                  <p className="text-sm text-neutral-600">{review.comment}</p>
                )}

                <p className="mt-2 text-xs text-neutral-400">
                  {new Date(review.createdAt).toLocaleDateString("es-PE")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deletingId !== null}
        title="Eliminar reseña"
        message="¿Estás segura de eliminar esta reseña? Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </>
  );
}
