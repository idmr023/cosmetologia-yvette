"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColaboradorRepository = void 0;
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
class ColaboradorRepository {
    async getAll() {
        return db_1.db.query.colaboradores.findMany();
    }
    async getById(id) {
        const row = await db_1.db.query.colaboradores.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.schema.colaboradores.id, id),
        });
        return row ?? null;
    }
    async create(data) {
        const [created] = await db_1.db.insert(db_1.schema.colaboradores).values(data).returning();
        return created;
    }
    async update(id, data) {
        const [updated] = await db_1.db
            .update(db_1.schema.colaboradores)
            .set(data)
            .where((0, drizzle_orm_1.eq)(db_1.schema.colaboradores.id, id))
            .returning();
        return updated;
    }
    async delete(id) {
        await db_1.db.delete(db_1.schema.colaboradores).where((0, drizzle_orm_1.eq)(db_1.schema.colaboradores.id, id));
    }
}
exports.ColaboradorRepository = ColaboradorRepository;
//# sourceMappingURL=colaboradorRepository.js.map