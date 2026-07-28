import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { db, schema } from "../lib/db";
import { sql } from "drizzle-orm";
import { ServiceRepository } from "../repositories/serviceRepository";

const router = Router();
const repo = new ServiceRepository();

const createSchema = z.object({
  name: z.string().min(1, "Nombre requerido."),
  category: z.string().min(1, "Categoría requerida."),
  durationMin: z.number().int().positive("Duración debe ser positiva."),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Precio inválido."),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  durationMin: z.number().int().positive().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offset = Number(req.query.offset) || 0;
      const limit = Number(req.query.limit) || 50;
      const services = await db.query.services.findMany({
        orderBy: (s, { asc }) => [asc(s.name)],
        limit,
        offset,
      });
      const [row] = await db.select({ count: sql<string>`count(*)` }).from(schema.services);
      const total = Number(row.count);
      res.json({ data: services, total, offset, limit });
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

      const service = await repo.create(body);

      res.status(201).json(service);
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
        res.status(404).json({ error: "Servicio no encontrado." });
        return;
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
      await repo.delete(req.params.id);

      res.json({ message: "Servicio eliminado correctamente." });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
