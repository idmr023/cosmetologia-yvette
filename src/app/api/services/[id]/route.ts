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
  if (body.name !== undefined) updates.name = body.name;
  if (body.category !== undefined) updates.category = body.category;
  if (body.durationMin !== undefined) updates.durationMin = body.durationMin;
  if (body.price !== undefined) updates.price = body.price;
  if (body.description !== undefined) updates.description = body.description;
  if (body.isActive !== undefined) updates.isActive = body.isActive;

  const [updated] = await db
    .update(schema.services)
    .set(updates)
    .where(eq(schema.services.id, params.id))
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
  await db.delete(schema.services).where(eq(schema.services.id, params.id));
  return NextResponse.json({ ok: true });
}
