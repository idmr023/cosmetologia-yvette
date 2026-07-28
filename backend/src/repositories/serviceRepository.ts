import { db, schema } from "../lib/db";
import { eq, desc } from "drizzle-orm";

type InsertData = typeof schema.services.$inferInsert;

export class ServiceRepository {
  async getAll() {
    return db.query.services.findMany({
      orderBy: [desc(schema.services.isActive), desc(schema.services.name)],
    });
  }

  async create(data: InsertData) {
    const [created] = await db.insert(schema.services).values(data).returning();
    return created;
  }

  async update(id: string, data: Partial<InsertData>) {
    const [updated] = await db
      .update(schema.services)
      .set(data)
      .where(eq(schema.services.id, id))
      .returning();
    return updated;
  }

  async delete(id: string) {
    await db.delete(schema.services).where(eq(schema.services.id, id));
  }
}
