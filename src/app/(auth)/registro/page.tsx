"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scissors, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { SECURITY_QUESTIONS } from "@/lib/security/questions";
import { validatePassword } from "@/lib/security/passwordPolicy";

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [question, setQuestion] = useState<string>(SECURITY_QUESTIONS[0]);
  const [answer, setAnswer] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const pwErrors = password ? validatePassword(password).errors : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      setError(pwCheck.errors.join(". "));
      return;
    }

    if (!answer.trim()) {
      setError("Debes responder la pregunta de seguridad");
      return;
    }

    if (!turnstileToken) {
      setError("Completa la verificación de seguridad");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          securityQuestion: question,
          securityAnswer: answer,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al registrar");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm text-center">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-600" />
        <h1 className="text-xl font-semibold text-ink">Cuenta creada</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Redirigiendo al login...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
          <Scissors className="h-7 w-7 text-gold" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold text-ink">Crear cuenta</h1>
        <p className="text-sm text-neutral-500">Centro de Estética Yvette</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="name"
          label="Nombre completo"
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
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
          id="phone"
          label="Teléfono (opcional)"
          type="tel"
          placeholder="987654321"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
        <Input
          id="password"
          label="Contraseña"
          type="password"
          placeholder="Mínimo 10 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        {pwErrors.length > 0 && (
          <ul className="rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-700">
            {pwErrors.map((err) => (
              <li key={err}>• {err}</li>
            ))}
          </ul>
        )}
        <Input
          id="confirmPassword"
          label="Confirmar contraseña"
          type="password"
          placeholder="••••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="question" className="text-sm font-medium text-neutral-700">
            Pregunta de seguridad
          </label>
          <select
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-touch w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            {SECURITY_QUESTIONS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
        <Input
          id="answer"
          label="Respuesta"
          type="text"
          placeholder="Tu respuesta"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
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

        <Button type="submit" size="lg" fullWidth disabled={loading || !turnstileToken}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-gold hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
