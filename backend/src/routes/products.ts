import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { db, schema } from "../lib/db";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.query;
      const filters = eq(schema.inventory.type, "venta");
      const where = category && typeof category === "string"
        ? and(filters, eq(schema.inventory.category, category))
        : filters;

      const products = await db
        .select()
        .from(schema.inventory)
        .where(where)
        .orderBy(schema.inventory.name);

      const categories = await db
        .select({ category: schema.inventory.category })
        .from(schema.inventory)
        .where(filters)
        .groupBy(schema.inventory.category);

      res.json({
        data: products.filter((p) => p.stockQty > 0),
        categories: categories.map((c) => c.category).filter(Boolean),
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [product] = await db
        .select()
        .from(schema.inventory)
        .where(and(eq(schema.inventory.id, req.params.id), eq(schema.inventory.type, "venta")))
        .limit(1);

      if (!product) {
        res.status(404).json({ error: "Producto no encontrado." });
        return;
      }

      res.json(product);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
