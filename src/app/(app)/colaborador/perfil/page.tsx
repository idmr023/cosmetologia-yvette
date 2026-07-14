"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Calendar } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { ColaboradorCalendar } from "@/components/ColaboradorCalendar";

export default function ColaboradorPerfilPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  return (
    <>
      <TopBar title="Mi Perfil" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <Card className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-2xl font-semibold text-gold">
            {name.charAt(0) || "C"}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">{name || "Colaboradora"}</h2>
            <p className="text-sm text-neutral-500">Centro de Estética Yvette</p>
          </div>
        </Card>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold text-ink">Mi calendario</h2>
          </div>
          <Card>
            <ColaboradorCalendar />
          </Card>
        </div>
      </div>
    </>
  );
}