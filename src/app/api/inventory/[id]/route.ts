import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
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
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) updates.name = body.name;
  if (body.type !== undefined) updates.type = body.type;
  if (body.category !== undefined) updates.category = body.category;
  if (body.stockQty !== undefined) updates.stockQty = body.stockQty;
  if (body.minStock !== undefined) updates.minStock = body.minStock;
  if (body.unitPrice !== undefined) updates.unitPrice = body.unitPrice;
  if (body.supplier !== undefined) updates.supplier = body.supplier;

  const [updated] = await db
    .update(schema.inventory)
    .set(updates)
    .where(eq(schema.inventory.id, params.id))
    .returning();
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
    .delete(schema.inventory)
    .where(eq(schema.inventory.id, params.id));
  return NextResponse.json({ ok: true });
}
