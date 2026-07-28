"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const inventoryRepository_1 = require("../repositories/inventoryRepository");
const router = (0, express_1.Router)();
const repo = new inventoryRepository_1.InventoryRepository();
const createSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Nombre requerido."),
    type: zod_1.z.enum(["uso", "venta"]),
    category: zod_1.z.string().optional().nullable(),
    stockQty: zod_1.z.number().int().min(0).optional(),
    minStock: zod_1.z.number().int().min(0).optional(),
    unitPrice: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable(),
    supplier: zod_1.z.string().optional().nullable(),
});
const updateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    type: zod_1.z.enum(["uso", "venta"]).optional(),
    category: zod_1.z.string().optional().nullable(),
    stockQty: zod_1.z.number().int().min(0).optional(),
    minStock: zod_1.z.number().int().min(0).optional(),
    unitPrice: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable(),
    supplier: zod_1.z.string().optional().nullable(),
});
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const offset = Number(req.query.offset) || 0;
        const limit = Number(req.query.limit) || 50;
        const items = await db_1.db.query.inventory.findMany({
            orderBy: (i, { asc }) => [asc(i.name)],
            limit,
            offset,
        });
        const [row] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(db_1.schema.inventory);
        const total = Number(row.count);
        res.json({ data: items, total, offset, limit });
    }
    catch (error) {
        next(error);
    }
});
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const body = createSchema.parse(req.body);
        const item = await repo.create(body);
        res.status(201).json(item);
    }
    catch (error) {
        next(error);
    }
});
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const body = updateSchema.parse(req.body);
        const updated = await repo.update(req.params.id, { ...body, updatedAt: new Date() });
        if (!updated) {
            res.status(404).json({ error: "Producto no encontrado." });
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
        res.json({ message: "Producto eliminado correctamente." });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=inventory.js.map