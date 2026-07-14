import { Scissors, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-ink py-10 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-white">
              <Scissors className="h-5 w-5 text-gold" strokeWidth={1.5} />
              <span>Yvette</span>
            </div>
            <p className="mt-3 text-sm text-neutral-400">
              Centro de Estética en Cercado de Lima. Desde 2005.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-white">Contacto</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                Cercado de Lima
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" />
                991 697 726
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-white">Horario</p>
            <ul className="mt-3 space-y-1 text-sm text-neutral-400">
              <li>Lunes a Sábado</li>
              <li>Atención por cita previa</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-700 pt-6 text-center text-xs text-neutral-500">
          <p>
            &copy; {new Date().getFullYear()} Yvette Estética. Todos los
            derechos reservados.
          </p>
          <p className="mt-1">
            Creado por{" "}
            <a
              href="https://portafolio-red-seven.vercel.app/es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline-offset-2 hover:underline"
            >
              IDMR
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
