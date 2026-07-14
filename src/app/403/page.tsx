import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <ShieldAlert className="h-12 w-12 text-gold" />
      <h1 className="text-2xl font-semibold text-ink">Acceso denegado</h1>
      <p className="max-w-sm text-sm text-neutral-500">
        No tienes permisos para ver esta página.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
