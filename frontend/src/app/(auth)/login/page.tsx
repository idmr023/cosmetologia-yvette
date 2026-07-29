"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Scissors, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useAuthStore } from "@/stores/authStore";

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/admin/inicio",
  colaborador: "/colaborador/mis-citas",
  cliente: "/cliente/inicio",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setRefreshToken = useAuthStore((s) => s.setRefreshToken);
  const setRole = useAuthStore((s) => s.setRole);

  async function checkMfa() {
    try {
      const res = await fetch(`/api/auth/mfa-status?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      return data.mfaEnabled === true;
    } catch {
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!turnstileToken) {
      setError("Completa la verificación de seguridad");
      return;
    }
    setError("");
    setLoading(true);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 7000)
    );

    try {
      const loginPromise = (async () => {
        if (!mfaRequired) {
          const needsMfa = await checkMfa();
          if (needsMfa) {
            setMfaRequired(true);
            setLoading(false);
            return;
          }
        }

        const result = await signIn("credentials", {
          email,
          password,
          turnstileToken,
          ...(mfaCode ? { mfaCode } : {}),
          redirect: false,
        });

        if (result?.error) {
          throw new Error("Invalid credentials");
        }

        const session = await getSession();
        const role = session?.user?.role ?? "cliente";
        if (session?.accessToken) setAccessToken(session.accessToken);
        if (session?.refreshToken) setRefreshToken(session.refreshToken);
        setRole(role);
        const fallback = ROLE_REDIRECTS[role] ?? "/";
        if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
          router.push(callbackUrl);
        } else {
          router.push(fallback);
        }
        router.refresh();
      })();

      await Promise.race([loginPromise, timeoutPromise]);
    } catch (err: unknown) {
      setLoading(false);
      const errorObj = err as Error;
      if (errorObj.message === "Timeout") {
        setError("El inicio de sesión demoró más de 7s. Por favor, ingresa tus datos de nuevo.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError("Email o contraseña incorrectos");
      }
    }
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

        {mfaRequired && (
          <Input
            id="mfaCode"
            label="Código de verificación (Google Authenticator)"
            type="text"
            placeholder="000000"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            required
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
          />
        )}

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
          disabled={loading || !turnstileToken || (mfaRequired && mfaCode.length !== 6)}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : mfaRequired ? (
            "Verificar código"
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
