import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";

import { db, schema } from "../lib/db";
import { authenticate } from "../middleware/auth";

const router = Router();

const verifySchema = z.object({
  code: z.string().min(1, "Código requerido."),
});

const validateSchema = z.object({
  userId: z.string().uuid("UserId inválido."),
  code: z.string().min(1, "Código requerido."),
});

router.post(
  "/setup",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const existing = await db
        .select()
        .from(schema.userMfa)
        .where(eq(schema.userMfa.userId, userId))
        .limit(1);

      if (existing.length > 0 && existing[0].isEnabled) {
        res.status(409).json({ error: "MFA ya está habilitado." });
        return;
      }

      const [user] = await db
        .select({ email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      if (!user) {
        res.status(404).json({ error: "Usuario no encontrado." });
        return;
      }

      const secret = generateSecret();
      const otpauth = generateURI({
        issuer: "Yvette Centro de Estética",
        label: user.email,
        secret,
      });
      const qrCodeUrl = await QRCode.toDataURL(otpauth);

      if (existing.length > 0) {
        await db
          .update(schema.userMfa)
          .set({ secret, isEnabled: false })
          .where(eq(schema.userMfa.userId, userId));
      } else {
        await db.insert(schema.userMfa).values({ userId, secret });
      }

      res.json({ secret, qrCodeUrl });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/verify",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const body = verifySchema.parse(req.body);

      const [mfa] = await db
        .select()
        .from(schema.userMfa)
        .where(eq(schema.userMfa.userId, userId))
        .limit(1);

      if (!mfa) {
        res.status(400).json({ error: "Primero ejecuta /setup." });
        return;
      }

      if (mfa.isEnabled) {
        res.status(409).json({ error: "MFA ya está habilitado." });
        return;
      }

      const result = await verify({ token: body.code, secret: mfa.secret });
      if (!result.valid) {
        res.status(401).json({ error: "Código inválido." });
        return;
      }

      await db
        .update(schema.userMfa)
        .set({ isEnabled: true })
        .where(eq(schema.userMfa.userId, userId));

      res.json({ message: "MFA habilitado correctamente." });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/validate",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = validateSchema.parse(req.body);

      const [mfa] = await db
        .select()
        .from(schema.userMfa)
        .where(eq(schema.userMfa.userId, body.userId))
        .limit(1);

      if (!mfa || !mfa.isEnabled) {
        res.status(400).json({ error: "MFA no está habilitado para este usuario." });
        return;
      }

      const result = await verify({ token: body.code, secret: mfa.secret });
      if (!result.valid) {
        res.status(401).json({ error: "Código inválido." });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/status",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const [mfa] = await db
        .select({ isEnabled: schema.userMfa.isEnabled })
        .from(schema.userMfa)
        .where(eq(schema.userMfa.userId, userId))
        .limit(1);

      res.json({ isEnabled: mfa?.isEnabled ?? false });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
