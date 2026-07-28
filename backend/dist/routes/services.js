"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const serviceRepository_1 = require("../repositories/serviceRepository");
const router = (0, express_1.Router)();
const repo = new serviceRepository_1.ServiceRepository();
const createSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Nombre requerido."),
    category: zod_1.z.string().min(1, "Categoría requerida."),
    durationMin: zod_1.z.number().int().positive("Duración debe ser positiva."),
    price: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/, "Precio inválido."),
    description: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().optional(),
});
const updateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    category: zod_1.z.string().min(1).optional(),
    durationMin: zod_1.z.number().int().positive().optional(),
    price: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    description: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().optional(),
});
router.get("/", async (req, res, next) => {
    try {
        const offset = Number(req.query.offset) || 0;
        const limit = Number(req.query.limit) || 50;
        const services = await db_1.db.query.services.findMany({
            orderBy: (s, { asc }) => [asc(s.name)],
            limit,
            offset,
        });
        const [row] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(db_1.schema.services);
        const total = Number(row.count);
        res.json({ data: services, total, offset, limit });
    }
    catch (error) {
        next(error);
    }
});
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const body = createSchema.parse(req.body);
        const service = await repo.create(body);
        res.status(201).json(service);
    }
    catch (error) {
        next(error);
    }
});
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const body = updateSchema.parse(req.body);
        const updated = await repo.update(req.params.id, body);
        if (!updated) {
            res.status(404).json({ error: "Servicio no encontrado." });
            return;
        }
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        await repo.delete(req.params.id);
        res.json({ message: "Servicio eliminado correctamente." });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=services.js.map