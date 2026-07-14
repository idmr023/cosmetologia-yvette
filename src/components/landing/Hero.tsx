import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { whatsappLink } from "@/lib/utils";

export function Hero() {
  const waLink = whatsappLink(
    "51991697726",
    "Hola, quisiera información sobre los servicios del Centro de Estética Yvette.",
  );

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-gradient-to-b from-pastel/40 via-white to-white pt-16">
      <div className="absolute right-0 top-1/4 hidden h-96 w-96 rounded-full bg-gold/10 blur-3xl lg:block" />
      <div className="absolute left-0 bottom-0 h-64 w-64 rounded-full bg-pastel/30 blur-3xl sm:block" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-8 lg:px-8 lg:py-24">
        <div className="flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-gold">Desde 2005</span>
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Belleza y estilo
            <br />
            <span className="text-gold">en cada detalle</span>
          </h1>

          <p className="max-w-md text-base leading-relaxed text-neutral-600 sm:text-lg">
            Centro de Estética Yvette en Cercado de Lima. Peluquería, color,
            laceados y tratamientos faciales con personal capacitado y
            tendencias actuales.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/reservar"
              className="flex min-h-touch items-center justify-center gap-2 rounded-full bg-ink px-7 text-base font-medium text-white transition-transform hover:scale-[1.02]"
            >
              Reservar cita
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-touch items-center justify-center rounded-full border border-neutral-300 px-7 text-base font-medium text-ink transition-colors hover:border-ink"
            >
              WhatsApp
            </a>
          </div>

          <div className="mt-4 flex gap-8 pt-4">
            <div>
              <p className="text-2xl font-semibold text-ink">20+</p>
              <p className="text-sm text-neutral-500">años de experiencia</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-ink">26+</p>
              <p className="text-sm text-neutral-500">servicios</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-ink">3</p>
              <p className="text-sm text-neutral-500">especialistas</p>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-pastel to-gold/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-8xl font-semibold text-ink/10">Y</p>
                <p className="mt-4 text-lg font-medium text-ink/40">
                  Yvette
                </p>
                <p className="text-sm text-ink/30">Estética Profesional</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 w-48 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
            <p className="text-xs font-medium uppercase tracking-wider text-gold">
              Atención
            </p>
            <p className="mt-1 text-sm text-neutral-700">
              Lunes a Sábado
            </p>
            <p className="text-sm text-neutral-500">Cercado de Lima</p>
          </div>
        </div>
      </div>
    </section>
  );
}
