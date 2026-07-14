"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#galeria", label: "Galería" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200/60 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-ink"
          onClick={() => setOpen(false)}
        >
          <Scissors className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <span>Yvette</span>
          <span className="hidden text-sm font-normal text-neutral-400 sm:inline">
            Centro de Estética
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="min-h-touch rounded-full border border-ink px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Ingresar
          </Link>
        </div>

        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-ink md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t border-neutral-200/60 bg-white transition-[max-height] duration-300 ease-in-out md:hidden",
          open ? "max-h-80" : "max-h-0",
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-touch items-center rounded-lg px-3 text-base font-medium text-neutral-700 transition-colors hover:bg-pastel/50"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-2 flex min-h-touch items-center justify-center rounded-full bg-ink px-5 text-base font-medium text-white"
          >
            Ingresar
          </Link>
        </div>
      </div>
    </header>
  );
}
