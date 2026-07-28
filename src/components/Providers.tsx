"use client";

import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/components/QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthTokenSync } from "@/components/AuthTokenSync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthTokenSync />
      <ToastProvider>
        <QueryProvider>{children}</QueryProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
