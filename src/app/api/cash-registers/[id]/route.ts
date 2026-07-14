import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [caja] = await db
    .select()
    .from(schema.cashRegisters)
    .where(eq(schema.cashRegisters.id, params.id));

  if (!caja) {
    return NextResponse.json({ error: "Caja no encontrada" }, { status: 404 });
  }

  const isAdmin = session.user.role === "admin";
  const isOwner =
    session.user.role === "colaborador" &&
    session.user.colaboradorId === caja.colaboradorId;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();

  const [totals] = await db
    .select({
      ingresos: sql<string>`COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0)`,
      egresos: sql<string>`COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END), 0)`,
    })
    .from(schema.cashMovements)
    .where(eq(schema.cashMovements.cajaId, params.id));

  const montoInicial = Number(caja.montoInicial);
  const ingresos = Number(totals?.ingresos ?? 0);
  const egresos = Number(totals?.egresos ?? 0);
  const montoEsperado = montoInicial + ingresos - egresos;
  const montoReal = Number(body.montoReal ?? montoEsperado);
  const diferencia = montoReal - montoEsperado;

  const [updated] = await db
    .update(schema.cashRegisters)
    .set({
      cierre: new Date(),
      montoEsperado: montoEsperado.toFixed(2),
      montoReal: montoReal.toFixed(2),
      diferencia: diferencia.toFixed(2),
      estado: "cerrada",
      notas: body.notas ?? null,
    })
    .where(eq(schema.cashRegisters.id, params.id))
    .returning();

  return NextResponse.json(updated);
}
