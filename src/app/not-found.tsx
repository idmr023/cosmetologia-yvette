import { Scissors } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <Scissors className="h-12 w-12 text-gold" />
      <h1 className="text-2xl font-semibold text-ink">Página no encontrada</h1>
      <p className="text-sm text-neutral-500">La página que buscas no existe.</p>
    </div>
  );
}
