import { Scissors, Heart, Award, Users } from "lucide-react";

const VALUES = [
  {
    icon: Award,
    title: "Calidad garantizada",
    desc: "Personal capacitado en una variedad de campos.",
  },
  {
    icon: Heart,
    title: "Satisfacción total",
    desc: "El cliente sale completamente satisfecho con el servicio.",
  },
  {
    icon: Scissors,
    title: "Tendencias actuales",
    desc: "Nos capacitamos siempre en nuevas tendencias.",
  },
  {
    icon: Users,
    title: "Atención cercana",
    desc: "Un trato personalizado para cada cliente.",
  },
];

export function About() {
  return (
    <section id="nosotros" className="bg-white py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <p className="text-sm font-medium uppercase tracking-widest text-gold">
              Nosotros
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Centro de Estética Yvette
            </h2>
            <p className="text-base leading-relaxed text-neutral-600">
              Brindamos atención y asesoramiento al cliente de la más alta
              calidad, con personal capacitado en una variedad de campos,
              orientado a satisfacer todas sus necesidades y expectativas.
            </p>
            <p className="text-base leading-relaxed text-neutral-600">
              Abiertas al servicio de nuestros clientes desde el 13 de febrero
              de 2005 en Cercado de Lima.
            </p>

            <div className="mt-2 rounded-2xl border border-neutral-200 bg-pastel/20 p-5">
              <p className="text-sm font-medium uppercase tracking-wider text-gold">
                Visión
              </p>
              <p className="mt-2 text-base text-neutral-700">
                Satisfacer todas las necesidades y expectativas de nuestros
                clientes con la más alta calidad.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-neutral-200 p-5 transition-colors hover:border-gold/30"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10">
                  <value.icon
                    className="h-5 w-5 text-gold"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-base font-semibold text-ink">
                  {value.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
