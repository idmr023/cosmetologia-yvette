import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rows = await db.query.serviceHistory.findMany({
    where: eq(schema.serviceHistory.clientId, params.id),
    with: {
      appointment: true,
      service: true,
    },
    orderBy: desc(schema.serviceHistory.performedAt),
  });

  const formatted = rows
    .filter((r) => r.appointment && r.service)
    .map((r) => ({
      id: r.id,
      appointmentId: r.appointmentId,
      serviceName: r.service!.name,
      serviceCategory: r.service!.category,
      appointmentDate: r.appointment!.startAt,
      appointmentStatus: r.appointment!.status,
      performedAt: r.performedAt,
    }));

  return NextResponse.json(formatted);
}
