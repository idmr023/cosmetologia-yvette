"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryRepository = void 0;
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
class InventoryRepository {
    async getAll() {
        return db_1.db.query.inventory.findMany();
    }
    async create(data) {
        const [created] = await db_1.db.insert(db_1.schema.inventory).values(data).returning();
        return created;
    }
    async update(id, data) {
        const [updated] = await db_1.db
            .update(db_1.schema.inventory)
            .set(data)
            .where((0, drizzle_orm_1.eq)(db_1.schema.inventory.id, id))
            .returning();
        return updated;
    }
    async delete(id) {
        await db_1.db.delete(db_1.schema.inventory).where((0, drizzle_orm_1.eq)(db_1.schema.inventory.id, id));
    }
}
exports.InventoryRepository = InventoryRepository;
//# sourceMappingURL=inventoryRepository.js.map