"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Package,
  Scissors,
  Briefcase,
  DollarSign,
  BarChart3,
  Wallet,
  UserCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const items: MenuItem[] = [
  { href: "/admin/inicio", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/citas", label: "Citas", icon: CalendarDays },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/servicios", label: "Servicios", icon: Scissors },
  { href: "/admin/colaboradores", label: "Colaboradoras", icon: Briefcase },
  { href: "/admin/inventario", label: "Inventario", icon: Package },
  { href: "/admin/comisiones", label: "Comisiones", icon: DollarSign },
  { href: "/admin/cajas", label: "Cajas", icon: Wallet },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/admin/perfil", label: "Perfil", icon: UserCircle },
];

export function MobileMenuGrid({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate}>
            <Card className="flex flex-col items-center gap-2 py-4 text-center transition-colors hover:bg-gold/5">
              <Icon className="h-6 w-6 text-gold" />
              <span className="text-xs font-medium text-ink dark:text-white">{item.label}</span>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
