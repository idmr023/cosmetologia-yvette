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
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.fullName !== undefined) updates.fullName = body.fullName;
  if (body.phone !== undefined) updates.phone = body.phone;
  if (body.specialty !== undefined) updates.specialty = body.specialty;
  if (body.commissionPct !== undefined) updates.commissionPct = body.commissionPct;
  if (body.isAvailable !== undefined) updates.isAvailable = body.isAvailable;
  if (body.colorTag !== undefined) updates.colorTag = body.colorTag;

  const [updated] = await db
    .update(schema.colaboradores)
    .set(updates)
    .where(eq(schema.colaboradores.id, params.id))
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

  const [col] = await db
    .select()
    .from(schema.colaboradores)
    .where(eq(schema.colaboradores.id, params.id));

  if (col?.userId) {
    await db.delete(schema.users).where(eq(schema.users.id, col.userId));
  }
  await db.delete(schema.colaboradores).where(eq(schema.colaboradores.id, params.id));

  return NextResponse.json({ ok: true });
}
