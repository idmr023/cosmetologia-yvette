"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionRepository = void 0;
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
class CommissionRepository {
    async getAll(filters) {
        const conditions = [];
        if (filters?.desde)
            conditions.push((0, drizzle_orm_1.gte)(db_1.schema.commissions.createdAt, new Date(filters.desde)));
        if (filters?.hasta)
            conditions.push((0, drizzle_orm_1.lte)(db_1.schema.commissions.createdAt, new Date(filters.hasta)));
        if (filters?.colaboradorId)
            conditions.push((0, drizzle_orm_1.eq)(db_1.schema.commissions.colaboradorId, filters.colaboradorId));
        return db_1.db.query.commissions.findMany({
            where: conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined,
            with: {
                appointment: { with: { client: true } },
                colaborador: true,
            },
        });
    }
    async pay(id) {
        const [updated] = await db_1.db
            .update(db_1.schema.commissions)
            .set({ status: "pagada", settledAt: new Date() })
            .where((0, drizzle_orm_1.eq)(db_1.schema.commissions.id, id))
            .returning();
        return updated;
    }
}
exports.CommissionRepository = CommissionRepository;
//# sourceMappingURL=commissionRepository.js.map