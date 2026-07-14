import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "@/lib/db";
import { logAuthEvent } from "@/lib/security/audit";
import { getClientIP } from "@/lib/security/request";

// Paso 1: dado un email, devuelve la pregunta de seguridad
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "get-question") {
    const email = body.email?.toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const [user] = await db
      .select({
        id: schema.users.id,
        securityQuestion: schema.users.securityQuestion,
        securityAnswerHash: schema.users.securityAnswerHash,
      })
      .from(schema.users)
      .where(eq(schema.users.email, email));

    // Anti user-enumeration: siempre devuelve una pregunta, aunque sea fake
    if (!user?.securityQuestion) {
      return NextResponse.json({
        question: "¿Nombre de tu primera mascota?",
        fake: true,
      });
    }

    return NextResponse.json({
      question: user.securityQuestion,
      userId: user.id,
    });
  }

  if (action === "verify-answer") {
    const { userId, answer } = body;
    if (!userId || !answer) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const [user] = await db
      .select({ securityAnswerHash: schema.users.securityAnswerHash })
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user?.securityAnswerHash) {
      return NextResponse.json({ error: "Respuesta incorrecta" }, { status: 403 });
    }

    const valid = await bcrypt.compare(answer.toLowerCase().trim(), user.securityAnswerHash);
    if (!valid) {
      const ip = await getClientIP();
      await logAuthEvent({
        action: "RECOVERY_ANSWER_FAIL",
        userId,
        ip,
        success: false,
      });
      return NextResponse.json({ error: "Respuesta incorrecta" }, { status: 403 });
    }

    return NextResponse.json({ verified: true, userId });
  }

  if (action === "reset-password") {
    const { userId, newPassword } = body;
    if (!userId || !newPassword) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const { validatePassword } = await import("@/lib/security/passwordPolicy");
    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.errors.join(". ") }, { status: 400 });
    }

    const [user] = await db
      .select({ id: schema.users.id, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(schema.users)
      .set({ passwordHash })
      .where(eq(schema.users.id, userId));

    const ip = await getClientIP();
    await logAuthEvent({
      action: "PASSWORD_RESET_SUCCESS",
      userId: user.id,
      email: user.email,
      ip,
      success: true,
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
}
