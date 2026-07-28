import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { db, schema } from "../lib/db";
import { sql } from "drizzle-orm";
import { InventoryRepository } from "../repositories/inventoryRepository";

const router = Router();
const repo = new InventoryRepository();

const createSchema = z.object({
  name: z.string().min(1, "Nombre requerido."),
  type: z.enum(["uso", "venta"]),
  category: z.string().optional().nullable(),
  stockQty: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable(),
  supplier: z.string().optional().nullable(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["uso", "venta"]).optional(),
  category: z.string().optional().nullable(),
  stockQty: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable(),
  supplier: z.string().optional().nullable(),
});

router.get(
  "/",
  authenticate,
  authorize("admin", "colaborador"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offset = Number(req.query.offset) || 0;
      const limit = Number(req.query.limit) || 50;
      const items = await db.query.inventory.findMany({
        orderBy: (i, { asc }) => [asc(i.name)],
        limit,
        offset,
      });
      const [row] = await db.select({ count: sql<string>`count(*)` }).from(schema.inventory);
      const total = Number(row.count);
      res.json({ data: items, total, offset, limit });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/",
  authenticate,
  authorize("admin", "colaborador"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createSchema.parse(req.body);

      const item = await repo.create(body);

      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "colaborador"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = updateSchema.parse(req.body);

      const updated = await repo.update(req.params.id, { ...body, updatedAt: new Date() });

      if (!updated) {
        res.status(404).json({ error: "Producto no encontrado." });
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

      res.json({ message: "Producto eliminado correctamente." });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
