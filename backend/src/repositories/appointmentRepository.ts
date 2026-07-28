import { db, schema } from "../lib/db";
import { eq, desc } from "drizzle-orm";

type InsertData = typeof schema.appointments.$inferInsert;

export class AppointmentRepository {
  async getAll() {
    const rows = await db.query.appointments.findMany({
      with: {
        client: true,
        colaborador: true,
        services: { with: { service: true } },
      },
      orderBy: [desc(schema.appointments.startAt)],
    });
    return rows.map((r: any) => ({
      id: r.id as string,
      clientName: `${r.client.firstName} ${r.client.lastName}`,
      clientPhone: r.client.phone,
      services: r.services.map((s: any) => s.service.name),
      colaboradorName: r.colaborador.fullName,
      startAt: r.startAt as Date,
      status: r.status as string,
      totalPrice: r.totalPrice as string,
    }));
  }

  async getById(id: string) {
    const row = await db.query.appointments.findFirst({
      where: eq(schema.appointments.id, id),
      with: {
        client: true,
        colaborador: true,
        services: { with: { service: true } },
      },
    });
    if (!row) return null;
    const r = row as any;
    return {
      id: r.id,
      clientName: `${r.client.firstName} ${r.client.lastName}`,
      clientPhone: r.client.phone,
      services: r.services.map((s: any) => s.service.name),
      colaboradorName: r.colaborador.fullName,
      startAt: r.startAt,
      status: r.status,
      totalPrice: r.totalPrice,
    };
  }

  async create(data: InsertData) {
    const [created] = await db.insert(schema.appointments).values(data).returning();
    return created;
  }

  async update(id: string, data: Partial<InsertData>) {
    const [updated] = await db
      .update(schema.appointments)
      .set(data)
      .where(eq(schema.appointments.id, id))
      .returning();
    return updated;
  }

  async delete(id: string) {
    await db.delete(schema.appointments).where(eq(schema.appointments.id, id));
  }
}
