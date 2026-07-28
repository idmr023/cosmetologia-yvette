"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const colaboradorRepository_1 = require("../repositories/colaboradorRepository");
const router = (0, express_1.Router)();
const repo = new colaboradorRepository_1.ColaboradorRepository();
const createSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "Nombre requerido."),
    phone: zod_1.z.string().optional().nullable(),
    specialty: zod_1.z.string().optional().nullable(),
    commissionPct: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    isAvailable: zod_1.z.boolean().optional(),
    colorTag: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string().email("Email inválido."),
    password: zod_1.z.string().min(6, "Mínimo 6 caracteres."),
});
const updateSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().optional().nullable(),
    specialty: zod_1.z.string().optional().nullable(),
    commissionPct: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    isAvailable: zod_1.z.boolean().optional(),
    colorTag: zod_1.z.string().optional().nullable(),
});
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const offset = Number(req.query.offset) || 0;
        const limit = Number(req.query.limit) || 50;
        const colaboradores = await db_1.db
            .select()
            .from(db_1.schema.colaboradores)
            .orderBy(db_1.schema.colaboradores.fullName)
            .limit(limit)
            .offset(offset);
        const [row] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(db_1.schema.colaboradores);
        const total = Number(row.count);
        res.json({ data: colaboradores, total, offset, limit });
    }
    catch (error) {
        next(error);
    }
});
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const body = createSchema.parse(req.body);
        const existing = await db_1.db
            .select({ id: db_1.schema.users.id })
            .from(db_1.schema.users)
            .where((0, drizzle_orm_1.eq)(db_1.schema.users.email, body.email))
            .limit(1);
        if (existing.length > 0) {
            res.status(409).json({ error: "El email ya está registrado." });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(body.password, 10);
        const [user] = await db_1.db
            .insert(db_1.schema.users)
            .values({
            email: body.email,
            passwordHash,
            name: body.fullName,
            phone: body.phone,
            role: "colaborador",
        })
            .returning();
        const [colaborador] = await db_1.db
            .insert(db_1.schema.colaboradores)
            .values({
            userId: user.id,
            fullName: body.fullName,
            phone: body.phone,
            specialty: body.specialty,
            commissionPct: body.commissionPct || "0",
            isAvailable: body.isAvailable ?? true,
            colorTag: body.colorTag,
        })
            .returning();
        res.status(201).json({ ...colaborador, user: { id: user.id, email: user.email } });
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
            res.status(404).json({ error: "Colaborador no encontrado." });
            return;
        }
        if (body.fullName && updated.userId) {
            await db_1.db
                .update(db_1.schema.users)
                .set({ name: body.fullName })
                .where((0, drizzle_orm_1.eq)(db_1.schema.users.id, updated.userId));
        }
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const colaborador = await repo.getById(req.params.id);
        if (!colaborador) {
            res.status(404).json({ error: "Colaborador no encontrado." });
            return;
        }
        if (colaborador.userId) {
            await db_1.db
                .delete(db_1.schema.users)
                .where((0, drizzle_orm_1.eq)(db_1.schema.users.id, colaborador.userId));
        }
        await repo.delete(req.params.id);
        res.json({ message: "Colaborador eliminado correctamente." });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=colaboradores.js.map