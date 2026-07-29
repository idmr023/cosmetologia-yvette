"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const { action, limit: limitStr } = req.query;
        const limit = Math.min(Number(limitStr) || 50, 200);
        const logs = await db_1.db
            .select({
            id: db_1.schema.auditLog.id,
            userId: db_1.schema.auditLog.userId,
            action: db_1.schema.auditLog.action,
            email: db_1.schema.auditLog.email,
            ip: db_1.schema.auditLog.ip,
            userAgent: db_1.schema.auditLog.userAgent,
            success: db_1.schema.auditLog.success,
            createdAt: db_1.schema.auditLog.createdAt,
        })
            .from(db_1.schema.auditLog)
            .where(action && typeof action === "string"
            ? (0, drizzle_orm_1.sql) `${db_1.schema.auditLog.action} = ${action}`
            : (0, drizzle_orm_1.sql) `1=1`)
            .orderBy((0, drizzle_orm_1.desc)(db_1.schema.auditLog.createdAt))
            .limit(limit);
        res.json({ data: logs, total: logs.length });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=audit.js.map