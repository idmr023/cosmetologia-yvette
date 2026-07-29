"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const clientRepository_1 = require("../repositories/clientRepository");
const router = (0, express_1.Router)();
const repo = new clientRepository_1.ClientRepository();
const createSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "Nombre requerido."),
    lastName: zod_1.z.string().min(1, "Apellido requerido."),
    phone: zod_1.z.string().min(1, "Teléfono requerido."),
    dni: zod_1.z.string().regex(/^\d{8}$/),
    email: zod_1.z.string().email().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
});
const updateSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().min(1).optional(),
    dni: zod_1.z.string().regex(/^\d{8}$/).optional(),
    email: zod_1.z.string().email().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
});
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const offset = Number(req.query.offset) || 0;
        const limit = Number(req.query.limit) || 50;
        const clients = await db_1.db.query.clients.findMany({
            orderBy: (c, { desc }) => [desc(c.createdAt)],
            limit,
            offset,
        });
        const [row] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(db_1.schema.clients);
        const total = Number(row.count);
        res.json({ data: clients, total, offset, limit });
    }
    catch (error) {
        next(error);
    }
});
router.get("/me", auth_1.authenticate, (0, auth_1.authorize)("cliente"), async (req, res, next) => {
    try {
        const clientId = req.user?.clientId;
        if (!clientId) {
            res.status(400).json({ error: "No se encontró cliente vinculado." });
            return;
        }
        const [client] = await db_1.db
            .select()
            .from(db_1.schema.clients)
            .where((0, drizzle_orm_1.eq)(db_1.schema.clients.id, clientId))
            .limit(1);
        if (!client) {
            res.status(404).json({ error: "Cliente no encontrado." });
            return;
        }
        res.json(client);
    }
    catch (error) {
        next(error);
    }
});
router.put("/me", auth_1.authenticate, (0, auth_1.authorize)("cliente"), async (req, res, next) => {
    try {
        const clientId = req.user?.clientId;
        if (!clientId) {
            res.status(400).json({ error: "No se encontró cliente vinculado." });
            return;
        }
        const body = updateSchema.parse(req.body);
        if (body.dni) {
            const existing = await db_1.db
                .select({ id: db_1.schema.clients.id })
                .from(db_1.schema.clients)
                .where((0, drizzle_orm_1.eq)(db_1.schema.clients.dni, body.dni));
            if (existing.length > 0 && existing[0].id !== clientId) {
                res.status(409).json({ error: "El DNI ya está en uso." });
                return;
            }
        }
        const updated = await repo.update(clientId, body);
        if (!updated) {
            res.status(404).json({ error: "Cliente no encontrado." });
            return;
        }
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const body = createSchema.parse(req.body);
        const existing = await db_1.db
            .select({ id: db_1.schema.clients.id })
            .from(db_1.schema.clients)
            .where((0, drizzle_orm_1.eq)(db_1.schema.clients.dni, body.dni))
            .limit(1);
        if (existing.length > 0) {
            res.status(409).json({ error: "El DNI ya está registrado." });
            return;
        }
        const client = await repo.create(body);
        res.status(201).json(client);
    }
    catch (error) {
        next(error);
    }
});
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const body = updateSchema.parse(req.body);
        if (body.dni) {
            const existing = await db_1.db
                .select({ id: db_1.schema.clients.id })
                .from(db_1.schema.clients)
                .where((0, drizzle_orm_1.eq)(db_1.schema.clients.dni, body.dni));
            if (existing.length > 0 &&
                existing[0].id !== req.params.id) {
                res.status(409).json({ error: "El DNI ya está en uso." });
                return;
            }
        }
        const updated = await repo.update(req.params.id, body);
        if (!updated) {
            res.status(404).json({ error: "Cliente no encontrado." });
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
        res.json({ message: "Cliente eliminado correctamente." });
    }
    catch (error) {
        next(error);
    }
});
router.get("/:id/history", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const offset = Number(req.query.offset) || 0;
        const limit = Number(req.query.limit) || 50;
        const history = await repo.getHistory(req.params.id);
        const total = history.length;
        res.json({ data: history.slice(offset, offset + limit), total, offset, limit });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=clients.js.map