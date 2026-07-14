"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scissors, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TurnstileWidget } from "@/components/TurnstileWidget";

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/admin/inicio",
  colaborador: "/colaborador/mis-citas",
  cliente: "/",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!turnstileToken) {
      setError("Completa la verificación de seguridad");
      return;
    }
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      turnstileToken,
      redirect: false,
    });

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role ?? "cliente";
    router.push(ROLE_REDIRECTS[role] ?? "/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
          <Scissors className="h-7 w-7 text-gold" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold text-ink">Yvette</h1>
        <p className="text-sm text-neutral-500">Centro de Estética</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          id="password"
          label="Contraseña"
          type="password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <TurnstileWidget
          onToken={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
        />

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          fullWidth
          disabled={loading || !turnstileToken}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Ingresar"
          )}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link href="/recuperar" className="text-neutral-500 hover:text-gold">
          Olvidé mi contraseña
        </Link>
        <Link href="/registro" className="font-medium text-gold hover:underline">
          Crear cuenta
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
        <ShieldCheck className="h-3.5 w-3.5 text-gold" />
        <span>Acceso protegido</span>
      </div>
    </div>
  );
}
