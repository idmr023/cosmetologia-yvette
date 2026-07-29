"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const cashRegisterRepository_1 = require("../repositories/cashRegisterRepository");
const router = (0, express_1.Router)();
const repo = new cashRegisterRepository_1.CashRegisterRepository();
const openSchema = zod_1.z.object({
    colaboradorId: zod_1.z.string().uuid(),
    montoInicial: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/, "Monto inválido."),
    notas: zod_1.z.string().optional().nullable(),
});
const closeSchema = zod_1.z.object({
    montoReal: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/, "Monto inválido."),
    notas: zod_1.z.string().optional().nullable(),
});
const movementSchema = zod_1.z.object({
    tipo: zod_1.z.enum(["ingreso", "egreso"]),
    monto: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/, "Monto inválido."),
    concepto: zod_1.z.string().min(1, "Concepto requerido."),
});
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const { estado } = req.query;
        const offset = Number(req.query.offset) || 0;
        const limit = Number(req.query.limit) || 50;
        const conditions = [];
        if (estado && typeof estado === "string") {
            conditions.push((0, drizzle_orm_1.eq)(db_1.schema.cashRegisters.estado, estado));
        }
        const where = req.user?.role === "admin"
            ? conditions.length > 0
                ? (0, drizzle_orm_1.and)(...conditions)
                : undefined
            : (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.cashRegisters.colaboradorId, req.user.colaboradorId), ...conditions);
        const registers = await db_1.db.query.cashRegisters.findMany({
            where,
            with: { colaborador: true },
            orderBy: (r, { desc }) => [desc(r.apertura)],
            limit,
            offset,
        });
        const [row] = where
            ? await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(db_1.schema.cashRegisters).where(where)
            : await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(db_1.schema.cashRegisters);
        const total = Number(row.count);
        res.json({ data: registers, total, offset, limit });
    }
    catch (error) {
        next(error);
    }
});
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const body = openSchema.parse(req.body);
        const colaboradorId = req.user?.role === "admin"
            ? body.colaboradorId
            : req.user.colaboradorId;
        const [open] = await db_1.db
            .select({ id: db_1.schema.cashRegisters.id })
            .from(db_1.schema.cashRegisters)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.cashRegisters.colaboradorId, colaboradorId), (0, drizzle_orm_1.eq)(db_1.schema.cashRegisters.estado, "abierta")))
            .limit(1);
        if (open) {
            res.status(409).json({ error: "Ya hay una caja abierta." });
            return;
        }
        const register = await repo.create({
            colaboradorId,
            montoInicial: body.montoInicial,
            notas: body.notas,
        });
        res.status(201).json(register);
    }
    catch (error) {
        next(error);
    }
});
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const body = closeSchema.parse(req.body);
        const [caja] = await db_1.db
            .select()
            .from(db_1.schema.cashRegisters)
            .where((0, drizzle_orm_1.eq)(db_1.schema.cashRegisters.id, req.params.id))
            .limit(1);
        if (!caja) {
            res.status(404).json({ error: "Caja no encontrada." });
            return;
        }
        if (caja.estado !== "abierta") {
            res.status(400).json({ error: "La caja ya está cerrada." });
            return;
        }
        const movements = await db_1.db
            .select({
            tipo: db_1.schema.cashMovements.tipo,
            monto: db_1.schema.cashMovements.monto,
        })
            .from(db_1.schema.cashMovements)
            .where((0, drizzle_orm_1.eq)(db_1.schema.cashMovements.cajaId, caja.id));
        let expected = parseFloat(caja.montoInicial);
        for (const m of movements) {
            const amount = parseFloat(m.monto);
            if (m.tipo === "ingreso") {
                expected += amount;
            }
            else {
                expected -= amount;
            }
        }
        const real = parseFloat(body.montoReal);
        const diferencia = real - expected;
        const [updated] = await db_1.db
            .update(db_1.schema.cashRegisters)
            .set({
            cierre: new Date(),
            montoEsperado: expected.toString(),
            montoReal: body.montoReal,
            diferencia: diferencia.toString(),
            estado: "cerrada",
            notas: body.notas || caja.notas,
        })
            .where((0, drizzle_orm_1.eq)(db_1.schema.cashRegisters.id, req.params.id))
            .returning();
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
router.get("/:id/movements", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const offset = Number(req.query.offset) || 0;
        const limit = Number(req.query.limit) || 50;
        const movements = await repo.getMovements(req.params.id);
        const total = movements.length;
        res.json({ data: movements.slice(offset, offset + limit), total, offset, limit });
    }
    catch (error) {
        next(error);
    }
});
router.post("/:id/movements", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const body = movementSchema.parse(req.body);
        const [caja] = await db_1.db
            .select({ id: db_1.schema.cashRegisters.id, estado: db_1.schema.cashRegisters.estado })
            .from(db_1.schema.cashRegisters)
            .where((0, drizzle_orm_1.eq)(db_1.schema.cashRegisters.id, req.params.id))
            .limit(1);
        if (!caja) {
            res.status(404).json({ error: "Caja no encontrada." });
            return;
        }
        if (caja.estado !== "abierta") {
            res.status(400).json({ error: "La caja está cerrada." });
            return;
        }
        const movement = await repo.addMovement(req.params.id, {
            tipo: body.tipo,
            monto: body.monto,
            concepto: body.concepto,
        });
        res.status(201).json(movement);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=cashRegisters.js.map