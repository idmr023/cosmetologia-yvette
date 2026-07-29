import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import { db, schema } from "../lib/db";
import { and, eq, gte, sql } from "drizzle-orm";
import { verifyTurnstile } from "../middleware/turnstile";

const router = Router();

const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

const loginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(1, "Contraseña requerida."),
  turnstileToken: z.string().nullable().optional(),
});

const registerSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(8, "Mínimo 8 caracteres."),
  name: z.string().min(1, "Nombre requerido."),
  dni: z.string().regex(/^\d{8}$/),
  phone: z.string().optional(),
  securityQuestion: z.string().optional(),
  securityAnswer: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const recoverySchema = z.object({
  email: z.string().email("Email inválido."),
});

const answerSchema = z.object({
  email: z.string().email("Email inválido."),
  answer: z.string().min(1, "Respuesta requerida."),
});

const resetSchema = z.object({
  email: z.string().email("Email inválido."),
  newPassword: z.string().min(8, "Mínimo 8 caracteres."),
});

async function isRateLimited(email: string): Promise<boolean> {
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
  const recent = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.loginAttempts)
    .where(
      and(
        eq(schema.loginAttempts.email, email),
        gte(schema.loginAttempts.createdAt, fifteenMinAgo),
      ),
    );
  return recent[0].count >= 10;
}

async function isLockedOut(email: string): Promise<boolean> {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  const failed = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.loginAttempts)
    .where(
      and(
        eq(schema.loginAttempts.email, email),
        eq(schema.loginAttempts.success, false),
        gte(schema.loginAttempts.createdAt, thirtyMinAgo),
      ),
    );
  return failed[0].count >= 5;
}

async function recordLoginAttempt(
  email: string,
  ip: string,
  success: boolean,
): Promise<void> {
  await db.insert(schema.loginAttempts).values({ email, ip, success });
}

async function verifyPassword(password: string, hash: string | null): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

function generateTokens(user: {
  id: string;
  email: string;
  role: string;
  colaboradorId?: string;
  clientId?: string;
}) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, colaboradorId: user.colaboradorId, clientId: user.clientId },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" },
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  return { accessToken, refreshToken, refreshTokenHash };
}

async function getColaboradorId(userId: string): Promise<string | undefined> {
  const [col] = await db
    .select({ id: schema.colaboradores.id })
    .from(schema.colaboradores)
    .where(eq(schema.colaboradores.userId, userId))
    .limit(1);
  return col?.id;
}

async function getClientId(userId: string): Promise<string | undefined> {
  const [client] = await db
    .select({ id: schema.clients.id })
    .from(schema.clients)
    .where(eq(schema.clients.userId, userId))
    .limit(1);
  return client?.id;
}

async function tryMigrateToArgon2(userId: string, password: string): Promise<void> {
  // No-op for bcrypt migration
}

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = loginSchema.parse(req.body);

      const turnstile = await verifyTurnstile(body.turnstileToken ?? null, req.ip);
      if (!turnstile.success) {
        res.status(400).json({ error: turnstile.error ?? "Verificación Turnstile fallida." });
        return;
      }

      if (await isRateLimited(body.email)) {
        await recordLoginAttempt(body.email, req.ip || "", false);
        res.status(429).json({ error: "Demasiados intentos. Espere 15 minutos." });
        return;
      }

      if (await isLockedOut(body.email)) {
        res.status(423).json({ error: "Cuenta bloqueada por 30 minutos." });
        return;
      }

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, body.email))
        .limit(1);

      if (!user || !user.passwordHash) {
        // Dummy hash — anti user-enumeration
        try { await bcrypt.hash("dummy", 10); } catch {}
        await recordLoginAttempt(body.email, req.ip || "", false);
        res.status(401).json({ error: "Credenciales inválidas." });
        return;
      }

      const valid = await verifyPassword(body.password, user.passwordHash);
      if (!valid) {
        await recordLoginAttempt(body.email, req.ip || "", false);
        res.status(401).json({ error: "Credenciales inválidas." });
        return;
      }

      await recordLoginAttempt(body.email, req.ip || "", true);

      // Migrate bcrypt → argon2 on successful login
      await tryMigrateToArgon2(user.id, body.password);

      const colaboradorId = user.role !== "cliente" ? await getColaboradorId(user.id) : undefined;
      const clientId = user.role === "cliente" ? await getClientId(user.id) : undefined;
      const { accessToken, refreshToken, refreshTokenHash } = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        colaboradorId,
        clientId,
      });

      // Store refresh token hash
      await db.insert(schema.refreshTokens).values({
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      res.json({
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl,
          colaboradorId,
          clientId,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: "Refresh token requerido." });
        return;
      }

      const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

      const [stored] = await db
        .select()
        .from(schema.refreshTokens)
        .where(
          and(
            eq(schema.refreshTokens.tokenHash, tokenHash),
            eq(schema.refreshTokens.isRevoked, false),
            gte(schema.refreshTokens.expiresAt, new Date()),
          ),
        )
        .limit(1);

      if (!stored) {
        res.status(401).json({ error: "Refresh token inválido o expirado." });
        return;
      }

      // Revoke old refresh token (rotation)
      await db
        .update(schema.refreshTokens)
        .set({ isRevoked: true })
        .where(eq(schema.refreshTokens.id, stored.id));

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, stored.userId))
        .limit(1);

      if (!user) {
        res.status(401).json({ error: "Usuario no encontrado." });
        return;
      }

      const colaboradorId = user.role !== "cliente" ? await getColaboradorId(user.id) : undefined;
      const clientId = user.role === "cliente" ? await getClientId(user.id) : undefined;
      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        colaboradorId,
        clientId,
      });

      await db.insert(schema.refreshTokens).values({
        userId: user.id,
        tokenHash: tokens.refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      res.json({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = registerSchema.parse(req.body);

      const existing = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, body.email))
        .limit(1);

      if (existing.length > 0) {
        res.status(409).json({ error: "El email ya está registrado." });
        return;
      }

      const [existingClient] = await db
        .select()
        .from(schema.clients)
        .where(eq(schema.clients.dni, body.dni))
        .limit(1);

      if (existingClient?.userId) {
        res.status(409).json({ error: "El DNI ya está vinculado a una cuenta." });
        return;
      }

      const passwordHash = await hashPassword(body.password);
      const securityAnswerHash = body.securityAnswer
        ? await hashPassword(body.securityAnswer)
        : null;

      const [user] = await db
        .insert(schema.users)
        .values({
          email: body.email,
          passwordHash,
          name: body.name,
          phone: body.phone,
          role: "cliente",
          securityQuestion: body.securityQuestion || null,
          securityAnswerHash,
        })
        .returning();

      // Auto-create linked client record
      const nameParts = body.name.split(" ");
      const firstName = body.firstName || nameParts[0] || body.name;
      const lastName = body.lastName || nameParts.slice(1).join(" ") || body.name;

      const client = existingClient
        ? (await db
            .update(schema.clients)
            .set({ userId: user.id })
            .where(eq(schema.clients.id, existingClient.id))
            .returning())[0]
        : (await db
            .insert(schema.clients)
            .values({
              userId: user.id,
              firstName,
              lastName,
              dni: body.dni,
              phone: body.phone || body.email,
              email: body.email,
            })
            .returning())[0];

      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: client.id,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/recuperar/get-question",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = recoverySchema.parse(req.body);

      const [user] = await db
        .select({ securityQuestion: schema.users.securityQuestion })
        .from(schema.users)
        .where(eq(schema.users.email, body.email))
        .limit(1);

      if (!user || !user.securityQuestion) {
        res.status(404).json({ error: "No se encontró pregunta de seguridad." });
        return;
      }

      res.json({ question: user.securityQuestion });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/recuperar/verify-answer",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = answerSchema.parse(req.body);

      const [user] = await db
        .select({ securityAnswerHash: schema.users.securityAnswerHash })
        .from(schema.users)
        .where(eq(schema.users.email, body.email))
        .limit(1);

      if (!user || !user.securityAnswerHash) {
        res.status(404).json({ error: "No se encontró pregunta de seguridad." });
        return;
      }

      const valid = await verifyPassword(body.answer, user.securityAnswerHash);
      if (!valid) {
        res.status(401).json({ error: "Respuesta incorrecta." });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/recuperar/reset-password",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = resetSchema.parse(req.body);

      const passwordHash = await hashPassword(body.newPassword);

      const [user] = await db
        .update(schema.users)
        .set({ passwordHash })
        .where(eq(schema.users.email, body.email))
        .returning({ id: schema.users.id });

      if (!user) {
        res.status(404).json({ error: "Usuario no encontrado." });
        return;
      }

      res.json({ message: "Contraseña actualizada correctamente." });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
