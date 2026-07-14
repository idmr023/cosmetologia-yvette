import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rows = await db.query.cashMovements.findMany({
    where: eq(schema.cashMovements.cajaId, params.id),
    with: { appointment: { with: { client: true } } },
    orderBy: desc(schema.cashMovements.createdAt),
  });

  return NextResponse.json(rows);
}

export async function POST(
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

  const [created] = await db
    .insert(schema.cashMovements)
    .values({
      cajaId: params.id,
      appointmentId: body.appointmentId ?? null,
      tipo: body.tipo,
      monto: body.monto,
      concepto: body.concepto ?? null,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
