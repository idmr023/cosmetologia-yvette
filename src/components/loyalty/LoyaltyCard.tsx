"use client";

import { useState, useEffect } from "react";
import { Award, Gift, Star, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface LoyaltyData {
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  tier: { id: string; name: string; color: string; discountPct: string; benefits: string[] } | null;
  nextTier: { name: string; minPoints: number; pointsNeeded: number } | null;
  transactions: { id: string; points: number; type: string; description: string; createdAt: string }[];
}

interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  rewardType: string;
}

export function LoyaltyCard({ clientId }: { clientId: string }) {
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRedeem, setShowRedeem] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      fetch(`/api/loyalty/points/${clientId}`).then((r) => r.json()),
      fetch("/api/loyalty/rewards").then((r) => r.json()),
    ]).then(([loyaltyData, rewardsData]) => {
      setData(loyaltyData);
      setRewards(rewardsData.data ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!data) return null;

  const tierColor = data.tier?.color ?? "#CD7F32";

  return (
    <div className="space-y-4">
      {/* Tier Card */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${tierColor}, ${tierColor}dd)` }}
      >
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
        <div className="relative z-10">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-white/80">
            <Award className="h-4 w-4" />
            {data.tier?.name ?? "Bronce"}
          </div>
          <div className="mb-4 text-4xl font-bold">{data.points}</div>
          <div className="text-sm text-white/80">puntos disponibles</div>

          {data.tier && data.tier.benefits.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.tier.benefits.map((b, i) => (
                <span key={i} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs">
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress to next tier */}
      {data.nextTier && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-neutral-500">Próximo nivel:</span>
            <span className="font-semibold text-ink">{data.nextTier.name}</span>
          </div>
          <div className="mb-1 h-2 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{
                width: `${Math.min(100, (data.totalEarned / data.nextTier.minPoints) * 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-neutral-400">
            {data.nextTier.pointsNeeded} puntos para {data.nextTier.name}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center">
          <p className="text-xs text-neutral-400">Ganados</p>
          <p className="text-lg font-bold text-green-600">{data.totalEarned}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center">
          <p className="text-xs text-neutral-400">Canjeados</p>
          <p className="text-lg font-bold text-amber-600">{data.totalRedeemed}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={() => setShowRedeem(!showRedeem)}
        >
          <Gift className="h-4 w-4" /> Canjear puntos
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={async () => {
            try {
              const res = await fetch(`/api/loyalty/referral/${clientId}`);
              const data = await res.json();
              const url = `${window.location.origin}/reservar?ref=${data.code?.code ?? ""}`;
              await navigator.clipboard.writeText(url);
              toast("Link de referido copiado!", "success");
            } catch {
              toast("No se pudo generar tu link de referido", "error");
            }
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Rewards grid */}
      {showRedeem && rewards.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-ink">Recompensas disponibles</p>
          <div className="grid gap-2">
            {rewards.map((reward) => (
              <button
                key={reward.id}
                onClick={async () => {
                  if (data.points < reward.pointsCost) {
                    toast("Puntos insuficientes", "error");
                    return;
                  }
                  const res = await fetch("/api/loyalty/redeem", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ clientId, rewardId: reward.id }),
                  });
                  if (res.ok) {
                    toast("Recompensa canjeada exitosamente!", "success");
                    setData((prev) => prev ? { ...prev, points: prev.points - reward.pointsCost } : prev);
                  } else {
                    const err = await res.json();
                    toast(err.error ?? "Error al canjear", "error");
                  }
                }}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                  data.points >= reward.pointsCost
                    ? "border-neutral-200 bg-white hover:border-gold/50"
                    : "border-neutral-100 bg-neutral-50 opacity-60",
                )}
                disabled={data.points < reward.pointsCost}
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{reward.name}</p>
                  {reward.description && (
                    <p className="text-xs text-neutral-400">{reward.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-gold">
                  <Star className="h-3.5 w-3.5" />
                  {reward.pointsCost}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      {data.transactions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-ink">Actividad reciente</p>
          <div className="space-y-1">
            {data.transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                <span className="text-neutral-600">{tx.description}</span>
                <span
                  className={cn(
                    "font-semibold",
                    tx.points > 0 ? "text-green-600" : "text-amber-600",
                  )}
                >
                  {tx.points > 0 ? "+" : ""}{tx.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
