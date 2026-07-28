import { db, schema } from "../lib/db";
import { eq } from "drizzle-orm";

type InsertData = typeof schema.inventory.$inferInsert;

export class InventoryRepository {
  async getAll() {
    return db.query.inventory.findMany();
  }

  async create(data: InsertData) {
    const [created] = await db.insert(schema.inventory).values(data).returning();
    return created;
  }

  async update(id: string, data: Partial<InsertData>) {
    const [updated] = await db
      .update(schema.inventory)
      .set(data)
      .where(eq(schema.inventory.id, id))
      .returning();
    return updated;
  }

  async delete(id: string) {
    await db.delete(schema.inventory).where(eq(schema.inventory.id, id));
  }
}
