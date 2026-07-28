import { db, schema } from "../lib/db";
import { eq } from "drizzle-orm";

type InsertData = typeof schema.colaboradores.$inferInsert;

export class ColaboradorRepository {
  async getAll() {
    return db.query.colaboradores.findMany();
  }

  async getById(id: string) {
    const row = await db.query.colaboradores.findFirst({
      where: eq(schema.colaboradores.id, id),
    });
    return row ?? null;
  }

  async create(data: InsertData) {
    const [created] = await db.insert(schema.colaboradores).values(data).returning();
    return created;
  }

  async update(id: string, data: Partial<InsertData>) {
    const [updated] = await db
      .update(schema.colaboradores)
      .set(data)
      .where(eq(schema.colaboradores.id, id))
      .returning();
    return updated;
  }

  async delete(id: string) {
    await db.delete(schema.colaboradores).where(eq(schema.colaboradores.id, id));
  }
}
