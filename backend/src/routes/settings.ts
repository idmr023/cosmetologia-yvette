import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { db, schema } from "../lib/db";
import { inArray } from "drizzle-orm";

const router = Router();

const updateSchema = z.object({
  key: z.string().min(1, "Key requerida."),
  value: z.string().min(1, "Value requerido."),
});

router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { keys } = req.query;

      if (!keys || typeof keys !== "string") {
        const all = await db.select().from(schema.settings);
        res.json(all);
        return;
      }

      const keyList = keys.split(",").map((k) => k.trim()).filter(Boolean);
      const results = await db
        .select()
        .from(schema.settings)
        .where(inArray(schema.settings.key, keyList));

      const map: Record<string, string> = {};
      for (const s of results) {
        map[s.key] = s.value;
      }

      res.json(map);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = updateSchema.parse(req.body);

      const [setting] = await db
        .insert(schema.settings)
        .values({ key: body.key, value: body.value })
        .onConflictDoUpdate({
          target: schema.settings.key,
          set: { value: body.value, updatedAt: new Date() },
        })
        .returning();

      res.json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      next(error);
    }
  },
);

export default router;
