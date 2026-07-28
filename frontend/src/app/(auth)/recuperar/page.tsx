"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scissors, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { validatePassword } from "@/lib/security/passwordPolicy";

type Step = "email" | "answer" | "reset" | "done";

export default function RecuperarPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGetQuestion(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get-question", email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error");
        setLoading(false);
        return;
      }

      setQuestion(data.question);
      if (data.userId) {
        setUserId(data.userId);
        setStep("answer");
      } else {
        // Usuario no existe — anti enumeration: mostramos la pregunta fake
        // pero al verificar la respuesta siempre fallará
        setStep("answer");
      }
      setLoading(false);
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  async function handleVerifyAnswer(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-answer", userId, answer }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Respuesta incorrecta");
        setLoading(false);
        return;
      }

      setStep("reset");
      setLoading(false);
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.valid) {
      setError(pwCheck.errors.join(". "));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password", userId, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error");
        setLoading(false);
        return;
      }

      setStep("done");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
          <Scissors className="h-7 w-7 text-gold" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold text-ink">Recuperar contraseña</h1>
      </div>

      {step === "email" && (
        <form onSubmit={handleGetQuestion} className="flex flex-col gap-4">
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
          {error && <ErrorBox message={error} />}
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continuar"}
          </Button>
        </form>
      )}

      {step === "answer" && (
        <form onSubmit={handleVerifyAnswer} className="flex flex-col gap-4">
          <div className="rounded-xl bg-pastel/30 px-4 py-3 text-sm text-neutral-600">
            {question}
          </div>
          <Input
            id="answer"
            label="Tu respuesta"
            type="text"
            placeholder="Escribe tu respuesta"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
            autoFocus
          />
          {error && <ErrorBox message={error} />}
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verificar"}
          </Button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="flex items-center justify-center gap-1 text-sm text-neutral-500 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <Input
            id="newPassword"
            label="Nueva contraseña"
            type="password"
            placeholder="Mínimo 10 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            autoFocus
          />
          <Input
            id="confirmNewPassword"
            label="Confirmar nueva contraseña"
            type="password"
            placeholder="••••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          {error && <ErrorBox message={error} />}
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Cambiar contraseña"}
          </Button>
        </form>
      )}

      {step === "done" && (
        <div className="text-center">
          <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-600" />
          <h2 className="text-xl font-semibold text-ink">Contraseña cambiada</h2>
          <p className="mt-2 text-sm text-neutral-500">Redirigiendo al login...</p>
        </div>
      )}

      {step !== "done" && (
        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/login" className="font-medium text-gold hover:underline">
            Volver al login
          </Link>
        </p>
      )}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
