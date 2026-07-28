import { SEED_SERVICES } from "@/lib/seed/services";
import { formatCurrency } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, string> = {
  Peluquería: "✂",
  Color: "🎨",
  "Tratamiento Capilar": "💧",
  Laceado: "✨",
  "Estética Facial": "🌿",
  Depilación: "🌸",
  Paquetes: "👑",
};

export function Services() {
  const categories = Array.from(
    new Set(SEED_SERVICES.map((s) => s.category)),
  );

  return (
    <section id="servicios" className="bg-white py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <p className="text-sm font-medium uppercase tracking-widest text-gold">
            Nuestros servicios
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Lo que hacemos
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600">
            Una amplia gama de servicios de peluquería y estética con productos
            de calidad y personal especializado.
          </p>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 sm:mb-12 sm:justify-center sm:overflow-visible">
          {categories.map((cat) => (
            <span
              key={cat}
              className="whitespace-nowrap rounded-full border border-neutral-200 bg-pastel/30 px-4 py-1.5 text-sm font-medium text-neutral-700"
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {SEED_SERVICES.map((service) => (
            <article
              key={service.name}
              className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:border-gold/40 hover:shadow-lg sm:p-6"
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pastel/50 text-xl">
                  {CATEGORY_ICONS[service.category] ?? "•"}
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                  {service.category}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-ink">
                {service.name}
              </h3>

              <div className="mt-3 flex items-center gap-3 text-sm text-neutral-500">
                <span>{service.durationMin} min</span>
                <span className="text-neutral-300">|</span>
                <span className="font-medium text-gold">
                  {formatCurrency(service.price)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
