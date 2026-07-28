import { Router, Request, Response, NextFunction } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { db, schema } from "../lib/db";
import { and, gte, lte, inArray, eq, sql } from "drizzle-orm";

const router = Router();

function getPeriodRange(period: string): { from: Date; to: Date; prevFrom: Date; prevTo: Date } {
  const to = new Date();
  let days = 30;
  if (period === "7d") days = 7;
  if (period === "90d") days = 90;
  const from = new Date(to.getTime() - days * 86400000);
  const prevFrom = new Date(from.getTime() - days * 86400000);
  const prevTo = new Date(from.getTime() - 86400000);
  return { from, to, prevFrom, prevTo };
}

router.get(
  "/analytics",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const period = (req.query.period as string) || "30d";
      const { from, to, prevFrom, prevTo } = getPeriodRange(period);

      const current = await db
        .select()
        .from(schema.appointments)
        .where(and(gte(schema.appointments.startAt, from), lte(schema.appointments.startAt, to)));

      const previous = await db
        .select()
        .from(schema.appointments)
        .where(and(gte(schema.appointments.startAt, prevFrom), lte(schema.appointments.startAt, prevTo)));

      const completed = current.filter((a) => a.status === "completada");
      const prevCompleted = previous.filter((a) => a.status === "completada");

      const totalRevenue = completed.reduce((s, a) => s + parseFloat(a.totalPrice), 0);
      const prevRevenue = prevCompleted.reduce((s, a) => s + parseFloat(a.totalPrice), 0);

      const newClients = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(schema.clients)
        .where(and(gte(schema.clients.createdAt, from), lte(schema.clients.createdAt, to)))
        .then((r) => Number(r[0].count));

      const prevClients = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(schema.clients)
        .where(and(gte(schema.clients.createdAt, prevFrom), lte(schema.clients.createdAt, prevTo)))
        .then((r) => Number(r[0].count));

      const revenueByDay: Record<string, { revenue: number; count: number }> = {};
      for (const a of completed) {
        const day = new Date(a.startAt).toISOString().split("T")[0];
        if (!revenueByDay[day]) revenueByDay[day] = { revenue: 0, count: 0 };
        revenueByDay[day].revenue += parseFloat(a.totalPrice);
        revenueByDay[day].count++;
      }

      const hourlyDistribution: { hour: string; count: number }[] = [];
      for (let h = 9; h <= 19; h++) {
        const count = completed.filter((a) => new Date(a.startAt).getHours() === h).length;
        hourlyDistribution.push({ hour: `${h}:00`, count });
      }

      // Heatmap: day × hour grid
      const heatmap: { day: string; hour: string; count: number }[] = [];
      const dayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      for (let d = 1; d <= 6; d++) {
        for (let h = 9; h <= 19; h++) {
          const count = completed.filter(
            (a) => new Date(a.startAt).getDay() === d && new Date(a.startAt).getHours() === h,
          ).length;
          heatmap.push({ day: dayLabels[d], hour: `${h}:00`, count });
        }
      }

      const serviceMap: Record<string, { count: number; revenue: number }> = {};
      const completedIds = completed.map((a) => a.id);
      if (completedIds.length > 0) {
        const apptServices = await db
          .select({ appointmentId: schema.appointmentServices.appointmentId, serviceId: schema.appointmentServices.serviceId })
          .from(schema.appointmentServices)
          .where(inArray(schema.appointmentServices.appointmentId, completedIds));

        const svcIds = [...new Set(apptServices.map((s) => s.serviceId))];
        const services = svcIds.length > 0
          ? await db.select({ id: schema.services.id, name: schema.services.name, price: schema.services.price }).from(schema.services).where(inArray(schema.services.id, svcIds))
          : [];

        for (const as of apptServices) {
          if (!serviceMap[as.serviceId]) serviceMap[as.serviceId] = { count: 0, revenue: 0 };
          serviceMap[as.serviceId].count++;
          const svc = services.find((s) => s.id === as.serviceId);
          if (svc) serviceMap[as.serviceId].revenue += parseFloat(svc.price);
        }
      }

      const topServiceIds = Object.entries(serviceMap)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 5)
        .map(([id]) => id);

      const topServiceNames = topServiceIds.length > 0
        ? await db.select({ id: schema.services.id, name: schema.services.name }).from(schema.services).where(inArray(schema.services.id, topServiceIds))
        : [];

      const topServices = topServiceIds.map((id) => {
        const svc = topServiceNames.find((s) => s.id === id);
        return {
          name: svc?.name ?? "—",
          count: serviceMap[id].count,
          revenue: serviceMap[id].revenue,
        };
      });

      const colaboradorMap: Record<string, { count: number; revenue: number }> = {};
      for (const a of completed) {
        if (!colaboradorMap[a.colaboradorId]) colaboradorMap[a.colaboradorId] = { count: 0, revenue: 0 };
        colaboradorMap[a.colaboradorId].count++;
        colaboradorMap[a.colaboradorId].revenue += parseFloat(a.totalPrice);
      }

      const colIds = Object.keys(colaboradorMap);
      const cols = colIds.length > 0
        ? await db.select({ id: schema.colaboradores.id, fullName: schema.colaboradores.fullName }).from(schema.colaboradores).where(inArray(schema.colaboradores.id, colIds))
        : [];

      const topColaboradores = colIds
        .map((id) => ({
          id,
          name: cols.find((c) => c.id === id)?.fullName ?? "—",
          ...colaboradorMap[id],
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const totalSlots = (() => {
        const weekdays = new Set<number>();
        for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
          if (d.getDay() !== 0) weekdays.add(d.getTime());
        }
        return weekdays.size * 10; // 10 hours per day
      })();

      const occupancyRate = totalSlots > 0 ? Math.round((completed.length / totalSlots) * 100) : 0;

      res.json({
        totalRevenue,
        prevRevenue,
        totalAppointments: completed.length,
        prevAppointments: prevCompleted.length,
        newClients,
        prevClients,
        occupancyRate,
        avgRating: 0,
        revenueByDay: Object.entries(revenueByDay).map(([date, d]) => ({
          day: new Date(date + "T00:00:00").toLocaleDateString("es-PE", { weekday: "short" }),
          revenue: d.revenue,
          count: d.count,
        })),
        topServices,
        topColaboradores,
        hourlyDistribution,
        heatmap,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { desde, hasta } = req.query;
      const offset = Number(req.query.offset) || 0;
      const limit = Number(req.query.limit) || 50;

      const fromDate = desde && typeof desde === "string"
        ? new Date(desde)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = hasta && typeof hasta === "string"
        ? new Date(hasta)
        : new Date();

      const appointments = await db
        .select({
          id: schema.appointments.id,
          status: schema.appointments.status,
          totalPrice: schema.appointments.totalPrice,
          startAt: schema.appointments.startAt,
          colaboradorId: schema.appointments.colaboradorId,
        })
        .from(schema.appointments)
        .where(
          and(
            gte(schema.appointments.startAt, fromDate),
            lte(schema.appointments.startAt, toDate),
          ),
        )
        .limit(limit)
        .offset(offset);

      const [countRow] = await db.select({ count: sql<string>`count(*)` }).from(schema.appointments).where(
        and(
          gte(schema.appointments.startAt, fromDate),
          lte(schema.appointments.startAt, toDate),
        ),
      );

      const completed = appointments.filter(
        (a) => a.status === "completada",
      );
      const revenue = completed.reduce(
        (sum, a) => sum + parseFloat(a.totalPrice),
        0,
      );

      const byColaboradorMap: Record<
        string,
        { count: number; revenue: number }
      > = {};
      for (const a of completed) {
        if (!byColaboradorMap[a.colaboradorId]) {
          byColaboradorMap[a.colaboradorId] = { count: 0, revenue: 0 };
        }
        byColaboradorMap[a.colaboradorId].count++;
        byColaboradorMap[a.colaboradorId].revenue += parseFloat(a.totalPrice);
      }

      const colaboradorIds = Object.keys(byColaboradorMap);
      const colaboradores = colaboradorIds.length > 0
        ? await db
            .select({ id: schema.colaboradores.id, fullName: schema.colaboradores.fullName })
            .from(schema.colaboradores)
            .where(
              inArray(schema.colaboradores.id, colaboradorIds),
            )
        : [];

      const byColaborador = colaboradores.map((c) => ({
        colaboradorId: c.id,
        colaboradorName: c.fullName,
        ...byColaboradorMap[c.id],
      }));

      const appointmentServices = await db
        .select({
          serviceId: schema.appointmentServices.serviceId,
          appointmentId: schema.appointmentServices.appointmentId,
        })
        .from(schema.appointmentServices)
        .where(
          inArray(schema.appointmentServices.appointmentId, completed.map((a) => a.id)),
        );

      const serviceCountMap: Record<string, number> = {};
      for (const as of appointmentServices) {
        serviceCountMap[as.serviceId] =
          (serviceCountMap[as.serviceId] || 0) + 1;
      }

      const topServiceIds = Object.entries(serviceCountMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id]) => id);

      const topServices = topServiceIds.length > 0
        ? await db
            .select({ id: schema.services.id, name: schema.services.name })
            .from(schema.services)
            .where(
              inArray(schema.services.id, topServiceIds),
            )
        : [];

      const topServicesWithCount = topServices.map((s) => ({
        ...s,
        count: serviceCountMap[s.id],
      }));

      const byDay: Record<string, { count: number; revenue: number }> = {};
      for (const a of completed) {
        const day = new Date(a.startAt).toISOString().split("T")[0];
        if (!byDay[day]) {
          byDay[day] = { count: 0, revenue: 0 };
        }
        byDay[day].count++;
        byDay[day].revenue += parseFloat(a.totalPrice);
      }

      const byStatus: Record<string, { count: number; revenue: number }> = {};
      for (const a of appointments) {
        const status = a.status;
        if (!byStatus[status]) {
          byStatus[status] = { count: 0, revenue: 0 };
        }
        byStatus[status].count++;
        if (status === "completada") {
          byStatus[status].revenue += parseFloat(a.totalPrice);
        }
      }

      res.json({
        revenue,
        appointmentCount: Number(countRow.count),
        completedCount: completed.length,
        byColaborador,
        topServices: topServicesWithCount,
        byDay: Object.entries(byDay).map(([date, data]) => ({
          date,
          ...data,
        })),
        byStatus,
        total: Number(countRow.count),
        offset,
        limit,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
