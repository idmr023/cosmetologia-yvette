import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { desc, eq, and, gte, lte } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  const estado = searchParams.get("estado");

  const conditions = [];
  if (desde) conditions.push(gte(schema.cashRegisters.apertura, new Date(desde)));
  if (hasta) conditions.push(lte(schema.cashRegisters.apertura, new Date(hasta)));
  if (estado) conditions.push(eq(schema.cashRegisters.estado, estado));

  if (session.user.role === "colaborador" && session.user.colaboradorId) {
    conditions.push(eq(schema.cashRegisters.colaboradorId, session.user.colaboradorId));
  }

  const rows = await db.query.cashRegisters.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    with: {
      colaborador: true,
      movements: true,
    },
    orderBy: desc(schema.cashRegisters.apertura),
  });

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let colaboradorId: string;
  let montoInicial: string;

  if (session.user.role === "admin") {
    const body = await req.json();
    colaboradorId = body.colaboradorId;
    montoInicial = body.montoInicial ?? "0";
  } else if (session.user.role === "colaborador" && session.user.colaboradorId) {
    colaboradorId = session.user.colaboradorId;
    const body = await req.json();
    montoInicial = body.montoInicial ?? "0";
  } else {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [existing] = await db
    .select()
    .from(schema.cashRegisters)
    .where(
      and(
        eq(schema.cashRegisters.estado, "abierta"),
        eq(schema.cashRegisters.colaboradorId, colaboradorId),
        gte(schema.cashRegisters.apertura, today),
        lte(schema.cashRegisters.apertura, tomorrow),
      ),
    );

  if (existing) {
    return NextResponse.json(
      { error: "Ya tienes una caja abierta para hoy" },
      { status: 409 },
    );
  }

  const [created] = await db
    .insert(schema.cashRegisters)
    .values({
      colaboradorId,
      montoInicial,
      estado: "abierta",
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
