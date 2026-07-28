import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { db, schema } from "../lib/db";
import { eq, and, desc, sql, type SQL } from "drizzle-orm";

const router = Router();

const sendSchema = z.object({
  type: z.enum(["reminder", "confirmation", "promotion", "low_stock", "review"]),
  recipientId: z.string(),
  title: z.string().optional(),
  body: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

router.post(
  "/send",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = sendSchema.parse(req.body);

      const [notification] = await db
        .insert(schema.notifications)
        .values({
          type: body.type,
          channel: "telegram",
          recipientId: body.recipientId,
          title: body.title,
          body: body.body,
          metadata: body.metadata ?? null,
          status: "pending",
        })
        .returning();

      // Enqueue for sending (simulated - in production, use a job queue)
      setTimeout(async () => {
        try {
          await db
            .update(schema.notifications)
            .set({ status: "sent", sentAt: new Date() })
            .where(eq(schema.notifications.id, notification.id));
        } catch {
          await db
            .update(schema.notifications)
            .set({ status: "failed" })
            .where(eq(schema.notifications.id, notification.id));
        }
      }, 100);

      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, status, limit: limitStr } = req.query;
      const limit = Math.min(Number(limitStr) || 50, 100);

      const conditions: SQL[] = [sql`1=1`];
      if (type && typeof type === "string") conditions.push(eq(schema.notifications.type, type));
      if (status && typeof status === "string") conditions.push(eq(schema.notifications.status, status));
      const filters = and(...conditions);

      const notifications = await db
        .select()
        .from(schema.notifications)
        .where(filters)
        .orderBy(desc(schema.notifications.createdAt))
        .limit(limit);

      res.json({ data: notifications, total: notifications.length });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/stats",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await db
        .select({
          type: schema.notifications.type,
          status: schema.notifications.status,
          count: sql<number>`COUNT(*)`,
        })
        .from(schema.notifications)
        .groupBy(schema.notifications.type, schema.notifications.status);

      res.json({ data: stats });
    } catch (error) {
      next(error);
    }
  },
);

export default router;