import { Router, Request, Response, NextFunction } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { db, schema } from "../lib/db";
import { desc, sql } from "drizzle-orm";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { action, limit: limitStr } = req.query;
      const limit = Math.min(Number(limitStr) || 50, 200);

      const logs = await db
        .select({
          id: schema.auditLog.id,
          userId: schema.auditLog.userId,
          action: schema.auditLog.action,
          email: schema.auditLog.email,
          ip: schema.auditLog.ip,
          userAgent: schema.auditLog.userAgent,
          success: schema.auditLog.success,
          createdAt: schema.auditLog.createdAt,
        })
        .from(schema.auditLog)
        .where(
          action && typeof action === "string"
            ? sql`${schema.auditLog.action} = ${action}`
            : sql`1=1`,
        )
        .orderBy(desc(schema.auditLog.createdAt))
        .limit(limit);

      res.json({ data: logs, total: logs.length });
    } catch (error) {
      next(error);
    }
  },
);

export default router;