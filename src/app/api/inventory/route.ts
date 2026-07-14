import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(schema.inventory)
    .orderBy(desc(schema.inventory.updatedAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "cliente") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const [created] = await db
    .insert(schema.inventory)
    .values({
      name: body.name,
      type: body.type,
      category: body.category ?? null,
      stockQty: body.stockQty ?? 0,
      minStock: body.minStock ?? 0,
      unitPrice: body.unitPrice ?? null,
      supplier: body.supplier ?? null,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
