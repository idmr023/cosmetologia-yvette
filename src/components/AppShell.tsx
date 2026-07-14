"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/navigation/BottomNav";
import { SideNav } from "@/components/navigation/SideNav";
import { Sheet } from "@/components/ui/Sheet";

function RoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  let role: "admin" | "colaborador" = "admin";
  let allowedRoles: ("admin" | "colaborador" | "cliente")[] = ["admin"];

  if (pathname.startsWith("/colaborador")) {
    role = "colaborador";
    allowedRoles = ["colaborador", "admin"];
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
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RoleShell>{children}</RoleShell>
    </SessionProvider>
  );
}
