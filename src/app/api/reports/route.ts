import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, gte, lte, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const dateFilter = [];
  if (desde) dateFilter.push(gte(schema.appointments.startAt, new Date(desde)));
  if (hasta) dateFilter.push(lte(schema.appointments.startAt, new Date(hasta)));

  const completedFilter = [
    eq(schema.appointments.status, "completada"),
    ...dateFilter,
  ];

  // Ingresos totales del período
  const [revenueResult] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${schema.appointments.totalPrice}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(schema.appointments)
    .where(and(...completedFilter));

  // Ingresos por colaboradora
  const byColaborador = await db
    .select({
      colaboradorId: schema.appointments.colaboradorId,
      fullName: schema.colaboradores.fullName,
      total: sql<string>`COALESCE(SUM(${schema.appointments.totalPrice}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(schema.appointments)
    .innerJoin(
      schema.colaboradores,
      eq(schema.appointments.colaboradorId, schema.colaboradores.id),
    )
    .where(and(...completedFilter))
    .groupBy(schema.appointments.colaboradorId, schema.colaboradores.fullName);

  // Servicios más populares
  const topServices = await db
    .select({
      serviceId: schema.appointmentServices.serviceId,
      name: schema.services.name,
      count: sql<number>`COUNT(*)`,
      revenue: sql<string>`COALESCE(SUM(${schema.appointments.totalPrice}), 0)`,
    })
    .from(schema.appointmentServices)
    .innerJoin(
      schema.appointments,
      eq(schema.appointmentServices.appointmentId, schema.appointments.id),
    )
    .innerJoin(
      schema.services,
      eq(schema.appointmentServices.serviceId, schema.services.id),
    )
    .where(and(eq(schema.appointments.status, "completada"), ...dateFilter))
    .groupBy(schema.appointmentServices.serviceId, schema.services.name)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(10);

  // Citas por día (últimos 30 días)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const byDay = await db
    .select({
      date: sql<string>`DATE(${schema.appointments.startAt})`,
      count: sql<number>`COUNT(*)`,
      revenue: sql<string>`COALESCE(SUM(${schema.appointments.totalPrice}), 0)`,
    })
    .from(schema.appointments)
    .where(
      and(
        gte(schema.appointments.startAt, thirtyDaysAgo),
        lte(schema.appointments.startAt, new Date()),
      ),
    )
    .groupBy(sql`DATE(${schema.appointments.startAt})`)
    .orderBy(sql`DATE(${schema.appointments.startAt})`);

  // Resumen de estados
  const byStatus = await db
    .select({
      status: schema.appointments.status,
      count: sql<number>`COUNT(*)`,
    })
    .from(schema.appointments)
    .groupBy(schema.appointments.status);

  return NextResponse.json({
    revenue: Number(revenueResult?.total ?? 0),
    appointmentCount: Number(revenueResult?.count ?? 0),
    byColaborador,
    topServices,
    byDay,
    byStatus,
  });
}
