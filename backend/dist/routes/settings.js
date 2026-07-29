"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
const updateSchema = zod_1.z.object({
    key: zod_1.z.string().min(1, "Key requerida."),
    value: zod_1.z.string().min(1, "Value requerido."),
});
router.get("/", async (req, res, next) => {
    try {
        const { keys } = req.query;
        if (!keys || typeof keys !== "string") {
            const all = await db_1.db.select().from(db_1.schema.settings);
            res.json(all);
            return;
        }
        const keyList = keys.split(",").map((k) => k.trim()).filter(Boolean);
        const results = await db_1.db
            .select()
            .from(db_1.schema.settings)
            .where((0, drizzle_orm_1.inArray)(db_1.schema.settings.key, keyList));
        const map = {};
        for (const s of results) {
            map[s.key] = s.value;
        }
        res.json(map);
    }
    catch (error) {
        next(error);
    }
});
router.put("/", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const body = updateSchema.parse(req.body);
        const [setting] = await db_1.db
            .insert(db_1.schema.settings)
            .values({ key: body.key, value: body.value })
            .onConflictDoUpdate({
            target: db_1.schema.settings.key,
            set: { value: body.value, updatedAt: new Date() },
        })
            .returning();
        res.json(setting);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
            return;
        }
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map