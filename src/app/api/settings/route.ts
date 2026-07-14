import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getSetting, setSetting } from "@/lib/settings";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keysParam = searchParams.get("keys");
  const keys = keysParam?.split(",") ?? [];
  const result: Record<string, string> = {};
  for (const k of keys) {
    result[k] = (await getSetting(k)) ?? "";
  }
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  if (!body.key || body.value === undefined) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }
  await setSetting(body.key, String(body.value));
  await db
    .update(schema.settings)
    .set({ value: String(body.value), updatedAt: new Date() })
    .where(eq(schema.settings.key, body.key));
  return NextResponse.json({ ok: true });
}