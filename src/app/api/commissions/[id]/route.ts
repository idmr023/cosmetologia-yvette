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

  const [updated] = await db
    .update(schema.commissions)
    .set({ status: "pagada", settledAt: new Date() })
    .where(eq(schema.commissions.id, params.id))
    .returning();

  return NextResponse.json(updated);
}
