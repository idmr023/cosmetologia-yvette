import { db, schema } from "../lib/db";
import { eq, and, gte, lte } from "drizzle-orm";

type InsertData = typeof schema.commissions.$inferInsert;

export class CommissionRepository {
  async getAll(filters?: { desde?: string; hasta?: string; colaboradorId?: string }) {
    const conditions = [];
    if (filters?.desde) conditions.push(gte(schema.commissions.createdAt, new Date(filters.desde)));
    if (filters?.hasta) conditions.push(lte(schema.commissions.createdAt, new Date(filters.hasta)));
    if (filters?.colaboradorId) conditions.push(eq(schema.commissions.colaboradorId, filters.colaboradorId));

    return db.query.commissions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        appointment: { with: { client: true } },
        colaborador: true,
      },
    });
  }

  async pay(id: string) {
    const [updated] = await db
      .update(schema.commissions)
      .set({ status: "pagada", settledAt: new Date() })
      .where(eq(schema.commissions.id, id))
      .returning();
    return updated;
  }
}
