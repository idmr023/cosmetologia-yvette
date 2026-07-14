import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Package,
  UserCircle,
  Scissors,
  Briefcase,
  DollarSign,
  BarChart3,
  Wallet,
  Grid3x3,
  QrCode,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_DESKTOP_NAV: NavItem[] = [
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

// BottomNav max 5 items — los más usados
export const ADMIN_MOBILE_NAV: NavItem[] = [
  { href: "/admin/inicio", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/citas", label: "Citas", icon: CalendarDays },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/inventario", label: "Inventario", icon: Package },
  { href: "", label: "Más", icon: Grid3x3 },
];

export const COLABORADOR_NAV: NavItem[] = [
  { href: "/colaborador/mis-citas", label: "Mis Citas", icon: CalendarDays },
  { href: "/colaborador/escanear", label: "Escanear", icon: QrCode },
  { href: "/colaborador/cajas", label: "Cajas", icon: Wallet },
  { href: "/colaborador/perfil", label: "Perfil", icon: UserCircle },
];
