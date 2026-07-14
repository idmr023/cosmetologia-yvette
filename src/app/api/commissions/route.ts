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
  const colaboradorId = searchParams.get("colaboradorId");

  const conditions = [];
  if (desde) conditions.push(gte(schema.commissions.createdAt, new Date(desde)));
  if (hasta) conditions.push(lte(schema.commissions.createdAt, new Date(hasta)));
  if (colaboradorId) conditions.push(eq(schema.commissions.colaboradorId, colaboradorId));

  const rows = await db.query.commissions.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    with: {
      appointment: { with: { client: true } },
      colaborador: true,
    },
    orderBy: desc(schema.commissions.createdAt),
  });

  return NextResponse.json(rows);
}
