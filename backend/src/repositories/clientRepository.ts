import { db, schema } from "../lib/db";
import { eq, desc } from "drizzle-orm";

type InsertData = typeof schema.clients.$inferInsert;

export class ClientRepository {
  async getAll() {
    return db.query.clients.findMany({
      orderBy: [desc(schema.clients.createdAt)],
    });
  }

  async create(data: InsertData) {
    const [created] = await db.insert(schema.clients).values(data).returning();
    return created;
  }

  async update(id: string, data: Partial<InsertData>) {
    const [updated] = await db
      .update(schema.clients)
      .set(data)
      .where(eq(schema.clients.id, id))
      .returning();
    return updated;
  }

  async delete(id: string) {
    await db.delete(schema.clients).where(eq(schema.clients.id, id));
  }

  async getHistory(clientId: string) {
    return db.query.serviceHistory.findMany({
      where: eq(schema.serviceHistory.clientId, clientId),
      with: {
        appointment: true,
        service: true,
      },
    });
  }
}
