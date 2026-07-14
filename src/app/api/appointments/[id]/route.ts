import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq, and, gte, lte } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "cliente") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.status) updates.status = body.status;
  if (body.startAt) updates.startAt = new Date(body.startAt);
  if (body.endAt) updates.endAt = new Date(body.endAt);
  if (body.notes !== undefined) updates.notes = body.notes;

  const [updated] = await db
    .update(schema.appointments)
    .set(updates)
    .where(eq(schema.appointments.id, params.id))
    .returning();

  // Auto-generar comisión cuando se completa la cita
  if (body.status === "completada") {
    const [existing] = await db
      .select()
      .from(schema.commissions)
      .where(eq(schema.commissions.appointmentId, params.id));

    if (!existing) {
      const [colaborador] = await db
        .select()
        .from(schema.colaboradores)
        .where(eq(schema.colaboradores.id, updated.colaboradorId));

      const pct = Number(colaborador?.commissionPct ?? 0);
      if (pct > 0) {
        const amount = (Number(updated.totalPrice) * pct) / 100;
        await db.insert(schema.commissions).values({
          appointmentId: updated.id,
          colaboradorId: updated.colaboradorId,
          amount: amount.toFixed(2),
          status: "pendiente",
        });
      }
    }

    // Registrar movimiento en caja abierta del día
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [cajaAbierta] = await db
      .select()
      .from(schema.cashRegisters)
      .where(
        and(
          eq(schema.cashRegisters.estado, "abierta"),
          eq(schema.cashRegisters.colaboradorId, updated.colaboradorId),
          gte(schema.cashRegisters.apertura, today),
          lte(schema.cashRegisters.apertura, tomorrow),
        ),
      );

    if (cajaAbierta) {
      await db.insert(schema.cashMovements).values({
        cajaId: cajaAbierta.id,
        appointmentId: updated.id,
        tipo: "ingreso",
        monto: updated.totalPrice,
        concepto: `Cita completada`,
      });
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  await db
    .delete(schema.appointments)
    .where(eq(schema.appointments.id, params.id));
  return NextResponse.json({ ok: true });
}
