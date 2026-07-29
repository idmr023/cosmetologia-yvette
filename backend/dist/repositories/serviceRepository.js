"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRepository = void 0;
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
class ServiceRepository {
    async getAll() {
        return db_1.db.query.services.findMany({
            orderBy: [(0, drizzle_orm_1.desc)(db_1.schema.services.isActive), (0, drizzle_orm_1.desc)(db_1.schema.services.name)],
        });
    }
    async create(data) {
        const [created] = await db_1.db.insert(db_1.schema.services).values(data).returning();
        return created;
    }
    async update(id, data) {
        const [updated] = await db_1.db
            .update(db_1.schema.services)
            .set(data)
            .where((0, drizzle_orm_1.eq)(db_1.schema.services.id, id))
            .returning();
        return updated;
    }
    async delete(id) {
        await db_1.db.delete(db_1.schema.services).where((0, drizzle_orm_1.eq)(db_1.schema.services.id, id));
    }
}
exports.ServiceRepository = ServiceRepository;
//# sourceMappingURL=serviceRepository.js.map