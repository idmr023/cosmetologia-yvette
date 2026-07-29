"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashRegisterRepository = void 0;
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
class CashRegisterRepository {
    async getAll(estado) {
        const where = estado ? (0, drizzle_orm_1.eq)(db_1.schema.cashRegisters.estado, estado) : undefined;
        return db_1.db.query.cashRegisters.findMany({
            where,
            with: { movements: true, colaborador: true },
        });
    }
    async getCurrent() {
        const row = await db_1.db.query.cashRegisters.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.schema.cashRegisters.estado, "abierta"),
            with: { movements: true, colaborador: true },
        });
        return row ?? null;
    }
    async create(data) {
        const [created] = await db_1.db.insert(db_1.schema.cashRegisters).values(data).returning();
        return created;
    }
    async close(id, montoReal, notas) {
        const caja = await db_1.db.query.cashRegisters.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.schema.cashRegisters.id, id),
        });
        if (!caja)
            throw new Error("Cash register not found");
        const montoEsperado = caja.montoEsperado ?? caja.montoInicial;
        const diferencia = (parseFloat(montoEsperado) - parseFloat(montoReal)).toFixed(2);
        const [updated] = await db_1.db
            .update(db_1.schema.cashRegisters)
            .set({
            estado: "cerrada",
            montoReal,
            diferencia,
            cierre: new Date(),
            notas: notas ?? null,
        })
            .where((0, drizzle_orm_1.eq)(db_1.schema.cashRegisters.id, id))
            .returning();
        return updated;
    }
    async getMovements(cajaId) {
        return db_1.db.query.cashMovements.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.schema.cashMovements.cajaId, cajaId),
            with: { appointment: true },
        });
    }
    async addMovement(cajaId, data) {
        const [movement] = await db_1.db
            .insert(db_1.schema.cashMovements)
            .values({ ...data, cajaId })
            .returning();
        return movement;
    }
}
exports.CashRegisterRepository = CashRegisterRepository;
//# sourceMappingURL=cashRegisterRepository.js.map