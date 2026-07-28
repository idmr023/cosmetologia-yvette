"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRepository = void 0;
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
class ClientRepository {
    async getAll() {
        return db_1.db.query.clients.findMany({
            orderBy: [(0, drizzle_orm_1.desc)(db_1.schema.clients.createdAt)],
        });
    }
    async create(data) {
        const [created] = await db_1.db.insert(db_1.schema.clients).values(data).returning();
        return created;
    }
    async update(id, data) {
        const [updated] = await db_1.db
            .update(db_1.schema.clients)
            .set(data)
            .where((0, drizzle_orm_1.eq)(db_1.schema.clients.id, id))
            .returning();
        return updated;
    }
    async delete(id) {
        await db_1.db.delete(db_1.schema.clients).where((0, drizzle_orm_1.eq)(db_1.schema.clients.id, id));
    }
    async getHistory(clientId) {
        return db_1.db.query.serviceHistory.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.schema.serviceHistory.clientId, clientId),
            with: {
                appointment: true,
                service: true,
            },
        });
    }
}
exports.ClientRepository = ClientRepository;
//# sourceMappingURL=clientRepository.js.map