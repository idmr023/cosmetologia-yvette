import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { db, schema } from "../lib/db";
import { eq, and, desc, sql } from "drizzle-orm";

const router = Router();

const createReviewSchema = z.object({
  appointmentId: z.string().uuid(),
  clientId: z.string().uuid().optional(),
  colaboradorId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { colaboradorId } = req.query;

      const filters = eq(schema.reviews.isPublic, true);
      const query = db
        .select()
        .from(schema.reviews)
        .where(
          colaboradorId && typeof colaboradorId === "string"
            ? and(filters, eq(schema.reviews.colaboradorId, colaboradorId))
            : filters,
        )
        .orderBy(desc(schema.reviews.createdAt))
        .limit(50);

      const reviews = await query;

      const ratingStats = await db
        .select({
          avg: sql<number>`AVG(rating)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(schema.reviews)
        .where(filters)
        .then((rows) => rows[0]);

      // Client names for public display
      const enriched = await Promise.all(
        reviews.map(async (r) => {
          const [client] = await db
            .select({ firstName: schema.clients.firstName })
            .from(schema.clients)
            .where(eq(schema.clients.id, r.clientId))
            .limit(1);
          const [colaborador] = await db
            .select({ fullName: schema.colaboradores.fullName })
            .from(schema.colaboradores)
            .where(eq(schema.colaboradores.id, r.colaboradorId))
            .limit(1);
          return {
            ...r,
            clientName: client?.firstName ?? "Cliente",
            colaboradorName: colaborador?.fullName ?? "Especialista",
          };
        }),
      );

      res.json({
        data: enriched,
        stats: {
          average: ratingStats?.avg ? Number(ratingStats.avg).toFixed(1) : "0.0",
          total: ratingStats?.count ?? 0,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/",
  authenticate,
  authorize("cliente"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createReviewSchema.parse(req.body);

      const clientId = req.user?.clientId;
      if (!clientId) {
        res.status(400).json({ error: "No se encontró cliente vinculado." });
        return;
      }

      const [existing] = await db
        .select({ id: schema.reviews.id })
        .from(schema.reviews)
        .where(eq(schema.reviews.appointmentId, body.appointmentId))
        .limit(1);

      if (existing) {
        res.status(409).json({ error: "Esta cita ya tiene una reseña." });
        return;
      }

      const [review] = await db
        .insert(schema.reviews)
        .values({
          appointmentId: body.appointmentId,
          clientId,
          colaboradorId: body.colaboradorId,
          serviceId: body.serviceId,
          rating: body.rating,
          comment: body.comment,
        })
        .returning();

      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:id/toggle-visibility",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [review] = await db
        .select({ isPublic: schema.reviews.isPublic })
        .from(schema.reviews)
        .where(eq(schema.reviews.id, req.params.id))
        .limit(1);
      if (!review) {
        res.status(404).json({ error: "Reseña no encontrada." });
        return;
      }
      const [updated] = await db
        .update(schema.reviews)
        .set({ isPublic: !review.isPublic })
        .where(eq(schema.reviews.id, req.params.id))
        .returning();
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await db.delete(schema.reviews).where(eq(schema.reviews.id, req.params.id));
      res.json({ message: "Reseña eliminada." });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/eligible",
  authenticate,
  authorize("cliente"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = req.user?.clientId;
      if (!clientId) {
        res.status(400).json({ error: "No se encontró cliente vinculado." });
        return;
      }

      const eligible = await db
        .select({
          id: schema.appointments.id,
          startAt: schema.appointments.startAt,
          colaboradorId: schema.appointments.colaboradorId,
          colaboradorName: schema.colaboradores.fullName,
          serviceName: schema.services.name,
          serviceId: schema.services.id,
        })
        .from(schema.appointments)
        .innerJoin(schema.colaboradores, eq(schema.colaboradores.id, schema.appointments.colaboradorId))
        .innerJoin(
          schema.appointmentServices,
          eq(schema.appointmentServices.appointmentId, schema.appointments.id),
        )
        .innerJoin(schema.services, eq(schema.services.id, schema.appointmentServices.serviceId))
        .leftJoin(schema.reviews, eq(schema.reviews.appointmentId, schema.appointments.id))
        .where(
          and(
            eq(schema.appointments.clientId, clientId),
            eq(schema.appointments.status, "completada"),
            sql`${schema.reviews.id} IS NULL`,
          ),
        )
        .orderBy(desc(schema.appointments.startAt))
        .limit(50);

      res.json({ data: eligible });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/mine",
  authenticate,
  authorize("cliente"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = req.user?.clientId;
      if (!clientId) {
        res.status(400).json({ error: "No se encontró cliente vinculado." });
        return;
      }

      const reviews = await db
        .select()
        .from(schema.reviews)
        .where(eq(schema.reviews.clientId, clientId))
        .orderBy(desc(schema.reviews.createdAt))
        .limit(50);

      const enriched = await Promise.all(
        reviews.map(async (r) => {
          const [colaborador] = await db
            .select({ fullName: schema.colaboradores.fullName })
            .from(schema.colaboradores)
            .where(eq(schema.colaboradores.id, r.colaboradorId))
            .limit(1);
          return {
            ...r,
            colaboradorName: colaborador?.fullName ?? "Especialista",
          };
        }),
      );

      res.json({ data: enriched });
    } catch (error) {
      next(error);
    }
  },
);

export default router;