"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Loader2, Copy, Users, Gift, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { LoyaltyCard } from "@/components/loyalty/LoyaltyCard";
import { formatDate } from "@/lib/utils";

interface ReferralData {
  code: { id: string; code: string; usageCount: number; maxUses: number | null };
  usage: { id: string; referredClientId: string; createdAt: string }[];
}

export default function ClienteFidelizacionPage() {
  const { data: session } = useSession();
  const clientId = session?.user?.clientId;
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    apiFetch(`/api/loyalty/referral/${clientId}`)
      .then((r) => r.json())
      .then((data) => setReferral(data))
      .catch(() => {});
  }, [clientId]);

  function copyLink() {
    if (!referral) return;
    const url = `${window.location.origin}/reservar?ref=${referral?.code?.code ?? ""}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  if (!clientId) {
    return (
      <>
        <TopBar title="Fidelización" />
        <div className="mx-auto max-w-2xl p-4">
          <p className="text-sm text-neutral-400">
            No se encontró información de fidelización.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Fidelización" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <LoyaltyCard clientId={clientId} />

        {/* Referral Section */}
        <Card className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" />
            <h3 className="font-semibold text-ink">Programa de Referidos</h3>
          </div>

          {referral ? (
            <>
              <p className="text-sm text-neutral-600">
                Invita a tus amigas y gana puntos. Por cada referido válido,
                ambos reciben un bono de puntos.
              </p>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="mb-1 text-xs text-neutral-400">Tu código de referido</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-mono font-semibold text-ink">
                    {referral?.code?.code ?? ""}
                  </code>
                  <button
                    onClick={copyLink}
                    className="flex min-h-touch min-w-touch items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:text-gold"
                    aria-label="Copiar link"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                {copied && (
                  <p className="mt-1 text-xs text-green-600">Link copiado al portapapeles</p>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Gift className="h-4 w-4 text-gold" />
                  <span className="text-neutral-600">
                    {referral?.code?.usageCount ?? 0} referidos
                  </span>
                </div>
                {referral?.code?.maxUses && (
                  <span className="text-xs text-neutral-400">
                    (máx {referral?.code?.maxUses})
                  </span>
                )}
              </div>

              {referral.usage.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-500">Referidos realizados</p>
                  {referral.usage.map((u) => (
                    <div key={u.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                      <span className="text-neutral-600">
                        Referido #{u.referredClientId.slice(0, 6).toUpperCase()}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {formatDate(u.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
            </div>
          )}
        </Card>
      </div>
    </>
  );
}