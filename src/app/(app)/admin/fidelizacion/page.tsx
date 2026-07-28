"use client";

import { useState, useEffect } from "react";
import { Award, Gift, Star, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  rewardType: string;
  rewardValue: string | null;
  isActive: boolean;
}

interface Tier {
  id: string;
  name: string;
  minPoints: number;
  discountPct: string;
  color: string;
  benefits: string[];
}

export default function FidelizacionPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPointsCost, setFormPointsCost] = useState("100");
  const [formRewardType, setFormRewardType] = useState("discount");
  const [formRewardValue, setFormRewardValue] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/loyalty/rewards").then((r) => r.json()),
      fetch("/api/loyalty/tiers").then((r) => r.json()),
    ])
      .then(([rewardsData, tiersData]) => {
        setRewards(rewardsData.data ?? []);
        setTiers(tiersData?.data ?? []);
      })
      .catch(() => {});
  }, []);

  async function handleCreateReward() {
    const res = await fetch("/api/loyalty/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formName,
        description: formDescription || undefined,
        pointsCost: Number(formPointsCost),
        rewardType: formRewardType,
        rewardValue: formRewardValue || undefined,
      }),
    });

    if (res.ok) {
      const created = await res.json();
      setRewards((prev) => [...prev, created]);
      setShowForm(false);
      setFormName(""); setFormDescription(""); setFormPointsCost("100"); setFormRewardValue("");
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    const res = await fetch(`/api/loyalty/rewards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (res.ok) {
      setRewards((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !isActive } : r)));
    }
  }

  return (
    <>
      <TopBar title="Fidelización" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Tiers */}
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-gold" />
            <h2 className="text-sm font-semibold text-ink">Niveles</h2>
          </div>
          <div className="space-y-2">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink">{tier.name}</p>
                    <p className="text-xs text-neutral-400">
                      Desde {tier.minPoints} pts · {tier.discountPct}% desc.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tier.benefits.map((b, i) => (
                    <Badge key={i} variant="neutral" className="text-[10px]">
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Rewards */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-gold" />
              <h2 className="text-sm font-semibold text-ink">Recompensas</h2>
            </div>
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4" /> Nueva
            </Button>
          </div>

          {showForm && (
            <div className="mb-4 space-y-3 rounded-xl border border-gold/30 bg-gold/5 p-4">
              <Input
                label="Nombre"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Corte gratis"
              />
              <Input
                label="Descripción"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descripción opcional"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Puntos requeridos"
                  type="number"
                  value={formPointsCost}
                  onChange={(e) => setFormPointsCost(e.target.value)}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700">Tipo</label>
                  <select
                    value={formRewardType}
                    onChange={(e) => setFormRewardType(e.target.value)}
                    className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white px-4 text-base focus:border-gold focus:outline-none"
                  >
                    <option value="discount">Descuento</option>
                    <option value="free_service">Servicio gratis</option>
                    <option value="product">Producto</option>
                    <option value="upgrade">Upgrade</option>
                  </select>
                </div>
              </div>
              <Input
                label="Valor (monto o ID)"
                value={formRewardValue}
                onChange={(e) => setFormRewardValue(e.target.value)}
                placeholder="Ej: 30 (para S/ 30 desc.)"
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateReward} size="sm">
                  <Star className="h-4 w-4" /> Crear
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {rewards.length === 0 && (
              <p className="py-4 text-center text-sm text-neutral-400">
                No hay recompensas configuradas
              </p>
            )}
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{reward.name}</p>
                    {!reward.isActive && (
                      <Badge variant="neutral" className="text-[10px]">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  {reward.description && (
                    <p className="text-xs text-neutral-400">{reward.description}</p>
                  )}
                  <p className="text-xs text-neutral-400">
                    {reward.rewardType} · {reward.rewardValue ?? "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gold">{reward.pointsCost} pts</span>
                  <button
                    onClick={() => handleToggleActive(reward.id, reward.isActive)}
                    className={cn(
                      "min-h-touch min-w-touch rounded-lg p-1 text-xs transition-colors",
                      reward.isActive ? "text-green-600" : "text-neutral-400",
                    )}
                  >
                    {reward.isActive ? "Activo" : "Inactivo"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Settings link */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4 text-neutral-400" />
              <span className="text-neutral-600">Configuración de puntos</span>
            </div>
            <span className="text-xs text-neutral-400">1 punto por S/ 1.00</span>
          </div>
        </div>
      </div>
    </>
  );
}
