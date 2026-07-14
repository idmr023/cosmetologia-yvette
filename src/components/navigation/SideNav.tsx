"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { ADMIN_DESKTOP_NAV, COLABORADOR_NAV, type NavItem } from "./navConfig";

interface SideNavProps {
  role: "admin" | "colaborador";
}

export function SideNav({ role }: SideNavProps) {
  const pathname = usePathname();
  const items: NavItem[] = role === "admin" ? ADMIN_DESKTOP_NAV : COLABORADOR_NAV;

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-neutral-200 bg-white md:block">
      <div className="flex h-16 items-center gap-2 border-b border-neutral-200 px-6">
        <Scissors className="h-5 w-5 text-gold" strokeWidth={1.5} />
        <span className="text-lg font-semibold text-ink">Yvette</span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-touch items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors",
                active
                  ? "bg-gold/10 text-gold"
                  : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800",
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
        <div className="mt-auto border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <DarkModeToggle className="w-full justify-start gap-3 rounded-xl px-4 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800" />
        </div>
      </nav>
    </aside>
  );
}
