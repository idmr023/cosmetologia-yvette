"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
const sendSchema = zod_1.z.object({
    type: zod_1.z.enum(["reminder", "confirmation", "promotion", "low_stock", "review"]),
    recipientId: zod_1.z.string(),
    title: zod_1.z.string().optional(),
    body: zod_1.z.string().min(1),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
router.post("/send", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const body = sendSchema.parse(req.body);
        const [notification] = await db_1.db
            .insert(db_1.schema.notifications)
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
                await db_1.db
                    .update(db_1.schema.notifications)
                    .set({ status: "sent", sentAt: new Date() })
                    .where((0, drizzle_orm_1.eq)(db_1.schema.notifications.id, notification.id));
            }
            catch {
                await db_1.db
                    .update(db_1.schema.notifications)
                    .set({ status: "failed" })
                    .where((0, drizzle_orm_1.eq)(db_1.schema.notifications.id, notification.id));
            }
        }, 100);
        res.status(201).json(notification);
    }
    catch (error) {
        next(error);
    }
});
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const { type, status, limit: limitStr } = req.query;
        const limit = Math.min(Number(limitStr) || 50, 100);
        const conditions = [(0, drizzle_orm_1.sql) `1=1`];
        if (type && typeof type === "string")
            conditions.push((0, drizzle_orm_1.eq)(db_1.schema.notifications.type, type));
        if (status && typeof status === "string")
            conditions.push((0, drizzle_orm_1.eq)(db_1.schema.notifications.status, status));
        const filters = (0, drizzle_orm_1.and)(...conditions);
        const notifications = await db_1.db
            .select()
            .from(db_1.schema.notifications)
            .where(filters)
            .orderBy((0, drizzle_orm_1.desc)(db_1.schema.notifications.createdAt))
            .limit(limit);
        res.json({ data: notifications, total: notifications.length });
    }
    catch (error) {
        next(error);
    }
});
router.get("/stats", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const stats = await db_1.db
            .select({
            type: db_1.schema.notifications.type,
            status: db_1.schema.notifications.status,
            count: (0, drizzle_orm_1.sql) `COUNT(*)`,
        })
            .from(db_1.schema.notifications)
            .groupBy(db_1.schema.notifications.type, db_1.schema.notifications.status);
        res.json({ data: stats });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map