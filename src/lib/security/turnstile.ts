export interface TurnstileVerifyResult {
  success: boolean;
  error?: string;
}

export async function verifyTurnstile(token: string | null, ip?: string): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return { success: false, error: "Turnstile no configurado" };
    }
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "Token Turnstile faltante" };
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    });
    const data = await res.json();

    if (!data.success) {
      return { success: false, error: data["error-codes"]?.join(", ") ?? "Verificación fallida" };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Error de conexión con Turnstile" };
  }
}
