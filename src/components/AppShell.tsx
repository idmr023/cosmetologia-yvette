"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/navigation/BottomNav";
import { SideNav } from "@/components/navigation/SideNav";
import { Sheet } from "@/components/ui/Sheet";
import { NetworkStatus } from "@/components/NetworkStatus";
import { useSyncStore } from "@/stores/syncStore";

function RoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const loadFromDb = useSyncStore((s) => s.loadFromDb);

  useEffect(() => {
    loadFromDb();
    const onOnline = () => useSyncStore.getState().process();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [loadFromDb]);

  let role: "admin" | "colaborador" | "cliente" = "admin";
  let allowedRoles: ("admin" | "colaborador" | "cliente")[] = ["admin"];

  if (pathname.startsWith("/colaborador")) {
    role = "colaborador";
    allowedRoles = ["colaborador", "admin"];
  } else if (pathname.startsWith("/cliente")) {
    role = "cliente";
    allowedRoles = ["cliente", "admin"];
  }

  return (
    <>
      <SideNav role={role} />
      <div className="md:ml-64">
        <AuthGuard allowedRoles={allowedRoles}>
          <div className="min-h-screen pb-20 md:pb-0">
            {children}
          </div>
        </AuthGuard>
      </div>
      <BottomNav role={role} />
      <Sheet />
      <NetworkStatus />
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return <RoleShell>{children}</RoleShell>;
}
