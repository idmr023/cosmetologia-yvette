"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: ("admin" | "colaborador" | "cliente")[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
    if (
      status === "authenticated" &&
      allowedRoles &&
      session?.user?.role &&
      !allowedRoles.includes(session.user.role)
    ) {
      router.replace("/403");
    }
  }, [status, session, allowedRoles, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return <>{children}</>;
}
