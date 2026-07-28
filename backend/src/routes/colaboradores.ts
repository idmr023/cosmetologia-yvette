import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authenticate, authorize } from "../middleware/auth";
import { db, schema } from "../lib/db";
import { eq, sql } from "drizzle-orm";
import { ColaboradorRepository } from "../repositories/colaboradorRepository";

const router = Router();
const repo = new ColaboradorRepository();

const createSchema = z.object({
  fullName: z.string().min(1, "Nombre requerido."),
  phone: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  commissionPct: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  isAvailable: z.boolean().optional(),
  colorTag: z.string().optional().nullable(),
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "Mínimo 6 caracteres."),
});

const updateSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  commissionPct: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  isAvailable: z.boolean().optional(),
  colorTag: z.string().optional().nullable(),
});

router.get(
  "/",
  authenticate,
  authorize("admin", "colaborador"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offset = Number(req.query.offset) || 0;
      const limit = Number(req.query.limit) || 50;
      const colaboradores = await db
        .select()
        .from(schema.colaboradores)
        .orderBy(schema.colaboradores.fullName)
        .limit(limit)
        .offset(offset);
      const [row] = await db.select({ count: sql<string>`count(*)` }).from(schema.colaboradores);
      const total = Number(row.count);
      res.json({ data: colaboradores, total, offset, limit });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createSchema.parse(req.body);

      const existing = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, body.email))
        .limit(1);

      if (existing.length > 0) {
        res.status(409).json({ error: "El email ya está registrado." });
        return;
      }

      const passwordHash = await bcrypt.hash(body.password, 10);

      const [user] = await db
        .insert(schema.users)
        .values({
          email: body.email,
          passwordHash,
          name: body.fullName,
          phone: body.phone,
          role: "colaborador",
        })
        .returning();

      const [colaborador] = await db
        .insert(schema.colaboradores)
        .values({
          userId: user.id,
          fullName: body.fullName,
          phone: body.phone,
          specialty: body.specialty,
          commissionPct: body.commissionPct || "0",
          isAvailable: body.isAvailable ?? true,
          colorTag: body.colorTag,
        })
        .returning();

      res.status(201).json({ ...colaborador, user: { id: user.id, email: user.email } });
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = updateSchema.parse(req.body);

      const updated = await repo.update(req.params.id, body);

      if (!updated) {
        res.status(404).json({ error: "Colaborador no encontrado." });
        return;
      }

      if (body.fullName && updated.userId) {
        await db
          .update(schema.users)
          .set({ name: body.fullName })
          .where(eq(schema.users.id, updated.userId));
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const colaborador = await repo.getById(req.params.id);

      if (!colaborador) {
        res.status(404).json({ error: "Colaborador no encontrado." });
        return;
      }

      if (colaborador.userId) {
        await db
          .delete(schema.users)
          .where(eq(schema.users.id, colaborador.userId));
      }

      await repo.delete(req.params.id);

      res.json({ message: "Colaborador eliminado correctamente." });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
