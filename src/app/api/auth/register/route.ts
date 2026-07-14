import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "@/lib/db";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { getClientIP } from "@/lib/security/request";
import { validatePassword } from "@/lib/security/passwordPolicy";
import { SECURITY_QUESTIONS } from "@/lib/security/questions";
import { logAuthEvent } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, password, securityQuestion, securityAnswer, turnstileToken } = body;

  if (!name || !email || !password || !securityQuestion || !securityAnswer) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const ip = await getClientIP();

  const turnstile = await verifyTurnstile(turnstileToken, ip);
  if (!turnstile.success) {
    return NextResponse.json({ error: "Verificación de seguridad fallida" }, { status: 403 });
  }

  const pwCheck = validatePassword(password);
  if (!pwCheck.valid) {
    return NextResponse.json({ error: pwCheck.errors.join(". ") }, { status: 400 });
  }

  if (!SECURITY_QUESTIONS.includes(securityQuestion)) {
    return NextResponse.json({ error: "Pregunta de seguridad inválida" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const [existing] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, normalizedEmail));

  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con este email" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);

  const [user] = await db
    .insert(schema.users)
    .values({
      name,
      email: normalizedEmail,
      phone: phone ?? null,
      passwordHash,
      role: "cliente",
      securityQuestion,
      securityAnswerHash,
    })
    .returning();

  await logAuthEvent({
    action: "REGISTER_SUCCESS",
    userId: user.id,
    email: normalizedEmail,
    ip,
    success: true,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
