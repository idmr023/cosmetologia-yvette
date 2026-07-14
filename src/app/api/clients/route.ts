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
    .select({
      id: schema.clients.id,
      firstName: schema.clients.firstName,
      lastName: schema.clients.lastName,
      phone: schema.clients.phone,
      email: schema.clients.email,
      notes: schema.clients.notes,
      createdAt: schema.clients.createdAt,
    })
    .from(schema.clients)
    .orderBy(desc(schema.clients.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "cliente") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const [created] = await db
    .insert(schema.clients)
    .values({
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      email: body.email ?? null,
      notes: body.notes ?? null,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
