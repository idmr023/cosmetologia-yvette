"use client";

import Link from "next/link";
import { LogOut, UserCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import { DarkModeToggle } from "@/components/DarkModeToggle";

interface TopBarProps {
  title: string;
  userName?: string;
}

export function TopBar({ title, userName }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95">
      <div>
        <h1 className="text-lg font-semibold text-ink dark:text-white">{title}</h1>
        {userName && (
          <p className="text-xs text-neutral-400">{userName}</p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Link
          href="/admin/perfil"
          aria-label="Perfil"
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-neutral-400 hover:text-ink dark:hover:text-white"
        >
          <UserCircle className="h-5 w-5" />
        </Link>
        <DarkModeToggle />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Cerrar sesión"
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-neutral-400 hover:text-ink dark:hover:text-white"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
