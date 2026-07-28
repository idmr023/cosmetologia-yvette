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
  TrendingUp,
  Award,
  MessageCircle,
  ShoppingBag,
  Star,
  Home,
  ScrollText,
  History,
  Settings,
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
  { href: "/admin/analitica", label: "Analítica", icon: TrendingUp },
  { href: "/admin/fidelizacion", label: "Fidelización", icon: Award },
  { href: "/admin/resenas", label: "Reseñas", icon: MessageCircle },
  { href: "/admin/inventario", label: "Inventario", icon: Package },
  { href: "/admin/comisiones", label: "Comisiones", icon: DollarSign },
  { href: "/admin/cajas", label: "Cajas", icon: Wallet },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/admin/notificaciones", label: "Notif.", icon: MessageCircle },
  { href: "/admin/audit", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/configuracion", label: "Config.", icon: Settings },
  { href: "/admin/perfil", label: "Perfil", icon: UserCircle },
];

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

export const CLIENTE_DESKTOP_NAV: NavItem[] = [
  { href: "/cliente/inicio", label: "Inicio", icon: Home },
  { href: "/cliente/citas", label: "Mis Citas", icon: CalendarDays },
  { href: "/cliente/historial", label: "Historial", icon: History },
  { href: "/cliente/fidelizacion", label: "Fidelización", icon: Award },
  { href: "/cliente/ordenes", label: "Mis Órdenes", icon: ShoppingBag },
  { href: "/cliente/resenas", label: "Mis Reseñas", icon: Star },
  { href: "/cliente/perfil", label: "Perfil", icon: UserCircle },
];

export const CLIENTE_MOBILE_NAV: NavItem[] = [
  { href: "/cliente/inicio", label: "Inicio", icon: Home },
  { href: "/cliente/citas", label: "Citas", icon: CalendarDays },
  { href: "/cliente/fidelizacion", label: "Puntos", icon: Award },
  { href: "/cliente/ordenes", label: "Órdenes", icon: ShoppingBag },
  { href: "", label: "Más", icon: Grid3x3 },
];