import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const rows = await db
    .select({
      id: schema.colaboradores.id,
      userId: schema.colaboradores.userId,
      fullName: schema.colaboradores.fullName,
      phone: schema.colaboradores.phone,
      specialty: schema.colaboradores.specialty,
      commissionPct: schema.colaboradores.commissionPct,
      isAvailable: schema.colaboradores.isAvailable,
      colorTag: schema.colaboradores.colorTag,
    })
    .from(schema.colaboradores)
    .orderBy(desc(schema.colaboradores.isAvailable), schema.colaboradores.fullName);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();

  const email = `${body.fullName.split(" ")[0].toLowerCase()}@yvette.com`;
  const tempPass = "colaborador2025";
  const hash = await bcrypt.hash(tempPass, 10);

  const [user] = await db
    .insert(schema.users)
    .values({
      email,
      passwordHash: hash,
      name: body.fullName,
      phone: body.phone ?? null,
      role: "colaborador",
    })
    .returning();

  const [created] = await db
    .insert(schema.colaboradores)
    .values({
      userId: user.id,
      fullName: body.fullName,
      phone: body.phone ?? null,
      specialty: body.specialty ?? null,
      commissionPct: body.commissionPct ?? "0",
      isAvailable: body.isAvailable ?? true,
      colorTag: body.colorTag ?? null,
    })
    .returning();

  return NextResponse.json({ ...created, email, tempPass }, { status: 201 });
}
