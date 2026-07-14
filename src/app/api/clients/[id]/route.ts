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
  const [updated] = await db
    .update(schema.clients)
    .set({
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      email: body.email ?? null,
      notes: body.notes ?? null,
    })
    .where(eq(schema.clients.id, params.id))
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
  await db.delete(schema.clients).where(eq(schema.clients.id, params.id));
  return NextResponse.json({ ok: true });
}
