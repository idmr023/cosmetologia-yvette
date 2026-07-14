import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const rows = await db
    .select()
    .from(schema.services)
    .orderBy(desc(schema.services.isActive), desc(schema.services.name));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const [created] = await db
    .insert(schema.services)
    .values({
      name: body.name,
      category: body.category,
      durationMin: body.durationMin,
      price: body.price,
      description: body.description ?? null,
      isActive: body.isActive ?? true,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
