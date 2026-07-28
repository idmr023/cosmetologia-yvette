import { CalendarDays, ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section
      id="contacto"
      className="bg-gradient-to-b from-pastel/20 to-white py-16 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-pastel/40 to-white p-8 text-center sm:p-12 lg:p-16">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
            <CalendarDays className="h-7 w-7 text-gold" strokeWidth={1.5} />
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Reserva tu cita
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-neutral-600">
            Sin necesidad de llamar, elige servicio, especialista y horario
            desde nuestra web.
          </p>

          <Link
            href="/reservar"
            className="mt-8 inline-flex min-h-touch items-center justify-center gap-2 rounded-full bg-ink px-8 text-base font-medium text-white transition-transform hover:scale-[1.02]"
          >
            Reservar ahora
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
