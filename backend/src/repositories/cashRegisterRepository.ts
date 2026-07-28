import { db, schema } from "../lib/db";
import { eq } from "drizzle-orm";

type InsertData = typeof schema.cashRegisters.$inferInsert;
type MovementInsert = typeof schema.cashMovements.$inferInsert;

export class CashRegisterRepository {
  async getAll(estado?: string) {
    const where = estado ? eq(schema.cashRegisters.estado, estado) : undefined;
    return db.query.cashRegisters.findMany({
      where,
      with: { movements: true, colaborador: true },
    });
  }

  async getCurrent() {
    const row = await db.query.cashRegisters.findFirst({
      where: eq(schema.cashRegisters.estado, "abierta"),
      with: { movements: true, colaborador: true },
    });
    return row ?? null;
  }

  async create(data: InsertData) {
    const [created] = await db.insert(schema.cashRegisters).values(data).returning();
    return created;
  }

  async close(id: string, montoReal: string, notas?: string) {
    const caja = await db.query.cashRegisters.findFirst({
      where: eq(schema.cashRegisters.id, id),
    });
    if (!caja) throw new Error("Cash register not found");

    const montoEsperado = caja.montoEsperado ?? caja.montoInicial;
    const diferencia = (parseFloat(montoEsperado) - parseFloat(montoReal)).toFixed(2);

    const [updated] = await db
      .update(schema.cashRegisters)
      .set({
        estado: "cerrada",
        montoReal,
        diferencia,
        cierre: new Date(),
        notas: notas ?? null,
      })
      .where(eq(schema.cashRegisters.id, id))
      .returning();
    return updated;
  }

  async getMovements(cajaId: string) {
    return db.query.cashMovements.findMany({
      where: eq(schema.cashMovements.cajaId, cajaId),
      with: { appointment: true },
    });
  }

  async addMovement(cajaId: string, data: Omit<MovementInsert, "cajaId">) {
    const [movement] = await db
      .insert(schema.cashMovements)
      .values({ ...data, cajaId })
      .returning();
    return movement;
  }
}
