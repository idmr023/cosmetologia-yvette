"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_MOBILE_NAV, COLABORADOR_NAV, type NavItem } from "./navConfig";
import { useSheetStore, Sheet } from "@/components/ui/Sheet";
import { MobileMenuGrid } from "@/components/modals/MobileMenuGrid";

interface BottomNavProps {
  role: "admin" | "colaborador";
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const sheet = useSheetStore();
  const items: NavItem[] = role === "admin" ? ADMIN_MOBILE_NAV : COLABORADOR_NAV;

  function handleClick(item: NavItem) {
    if (item.href === "") {
      sheet.show(<MobileMenuGrid onNavigate={sheet.close} />);
    }
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur-md md:hidden dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {items.map((item) => {
            const active = item.href && (pathname === item.href || pathname.startsWith(item.href + "/"));
            const Icon = item.icon;
            const content = (
              <div
                className={cn(
                  "flex min-h-touch flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-xs font-medium transition-colors",
                  active ? "text-gold" : "text-neutral-400",
                )}
                onClick={() => handleClick(item)}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="truncate">{item.label}</span>
              </div>
            );

            if (item.href) {
              return (
                <Link key={item.label} href={item.href} className="flex-1">
                  {content}
                </Link>
              );
            }

            return (
              <button key={item.label} type="button" className="flex-1 cursor-pointer" onClick={() => handleClick(item)}>
                {content}
              </button>
            );
          })}
        </div>
      </nav>
      <Sheet />
    </>
  );
}
