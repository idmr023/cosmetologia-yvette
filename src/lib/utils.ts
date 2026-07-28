import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(n);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function isLowStock(stock: number, min: number): boolean {
  return stock <= min;
}

export function formatBoletaNumber(id: string, date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  const yyyymmdd = d.toISOString().slice(0, 10).replace(/-/g, "");
  return `B${yyyymmdd}-${id.slice(0, 6).toUpperCase()}`;
}

export function unwrapResponse<T>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];
  if (json && typeof json === "object" && "data" in (json as Record<string, unknown>)) {
    return (json as { data: T[] }).data;
  }
  return [];
}

