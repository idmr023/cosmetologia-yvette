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
  const rows = await db.query.appointments.findMany({
    with: {
      client: true,
      colaborador: true,
      services: { with: { service: true } },
    },
    orderBy: desc(schema.appointments.startAt),
  });

  const formatted = rows.map((r) => ({
    id: r.id,
    clientName: r.client
      ? `${r.client.firstName} ${r.client.lastName}`
      : "Cliente",
    clientPhone: r.client?.phone ?? "",
    services: r.services.map((s) => s.service?.name).filter(Boolean) as string[],
    colaboradorName: r.colaborador?.fullName ?? "Sin asignar",
    startAt: r.startAt,
    status: r.status,
    totalPrice: r.totalPrice,
  }));

  return NextResponse.json(formatted);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "cliente") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const [created] = await db
    .insert(schema.appointments)
    .values({
      clientId: body.clientId,
      colaboradorId: body.colaboradorId,
      startAt: new Date(body.startAt),
      endAt: new Date(body.endAt),
      totalPrice: body.totalPrice,
      notes: body.notes ?? null,
      status: body.status ?? "pendiente",
    })
    .returning();

  if (body.serviceIds?.length) {
    await db.insert(schema.appointmentServices).values(
      body.serviceIds.map((sid: string) => ({
        appointmentId: created.id,
        serviceId: sid,
      })),
    );
  }

  return NextResponse.json(created, { status: 201 });
}
