import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { db, schema } from "../lib/db";
import { eq, and, inArray, sql, gte, lte } from "drizzle-orm";
import { AppointmentRepository } from "../repositories/appointmentRepository";
import { ClientRepository } from "../repositories/clientRepository";
import { earnPoints } from "./loyalty";
import { sendAppointmentConfirmation, sendReviewRequest } from "../lib/notifications";

const router = Router();
const appointmentRepo = new AppointmentRepository();
const clientRepo = new ClientRepository();

const createSchema = z.object({
  clientId: z.string().uuid(),
  colaboradorId: z.string().uuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  serviceIds: z.array(z.string().uuid()).min(1, "Al menos un servicio."),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["pendiente", "confirmada", "completada", "cancelada"]),
});

const publicCreateSchema = z.object({
  clientName: z.string().min(1, "Nombre es requerido"),
  clientDni: z.string().regex(/^\d{8}$/),
  clientPhone: z.string().min(6, "Teléfono es requerido"),
  clientEmail: z.string().email().optional().or(z.literal("")),
  serviceId: z.string().uuid(),
  colaboradorId: z.string().uuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  modality: z.enum(["salon", "domicilio"]).optional().default("salon"),
  notes: z.string().optional(),
});

const SLOT_DURATION_MIN = 30;
const BUSINESS_HOURS_START = 9;
const BUSINESS_HOURS_END = 19;
const MAX_ADVANCE_DAYS = 30;

router.get(
  "/",
  authenticate,
  authorize("admin", "colaborador"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offset = Number(req.query.offset) || 0;
      const limit = Number(req.query.limit) || 50;
      const appointments = await db.query.appointments.findMany({
        with: {
          client: true,
          colaborador: true,
          services: { with: { service: true } },
        },
        orderBy: (a, { desc }) => [desc(a.startAt)],
        limit,
        offset,
      });
      const [row] = await db.select({ count: sql<string>`count(*)` }).from(schema.appointments);
      const total = Number(row.count);
      res.json({ data: appointments, total, offset, limit });
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

        const appointments = await db.query.appointments.findMany({
          where: eq(schema.appointments.clientId, clientId),
          with: {
            client: true,
            colaborador: true,
            services: { with: { service: true } },
          },
          orderBy: (a, { desc }) => [desc(a.startAt)],
          limit: 50,
        });

        res.json({ data: appointments });
      } catch (error) {
        next(error);
      }
    },
  );

router.post(
  "/",
  authenticate,
  authorize("admin", "colaborador"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createSchema.parse(req.body);

      const services = await db
        .select({ id: schema.services.id, price: schema.services.price })
        .from(schema.services)
        .where(inArray(schema.services.id, body.serviceIds));

      const totalPrice = services.reduce(
        (sum, s) => sum + parseFloat(s.price),
        0,
      );

      const appointment = await appointmentRepo.create({
        clientId: body.clientId,
        colaboradorId: body.colaboradorId,
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
        totalPrice: totalPrice.toString(),
        notes: body.notes,
      });

      await db.insert(schema.appointmentServices).values(
        body.serviceIds.map((serviceId) => ({
          appointmentId: appointment.id,
          serviceId,
        })),
      );

      const [serviceNames] = await db
        .select({ name: schema.services.name })
        .from(schema.services)
        .where(inArray(schema.services.id, body.serviceIds))
        .limit(1);

      const [clientData] = await db
        .select({ firstName: schema.clients.firstName, lastName: schema.clients.lastName })
        .from(schema.clients)
        .where(eq(schema.clients.id, body.clientId))
        .limit(1);

      const [colaboradorData] = await db
        .select({ fullName: schema.colaboradores.fullName })
        .from(schema.colaboradores)
        .where(eq(schema.colaboradores.id, body.colaboradorId))
        .limit(1);

      const startDate = new Date(body.startAt);
      const aptDate = startDate.toLocaleDateString("es-PE");
      const aptTime = startDate.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

      sendAppointmentConfirmation(
        body.clientId,
        body.colaboradorId,
        clientData ? `${clientData.firstName} ${clientData.lastName}`.trim() : "Cliente",
        serviceNames?.name ?? "Servicio",
        colaboradorData?.fullName ?? "Especialista",
        aptDate,
        aptTime,
        "salon",
        totalPrice.toString(),
      ).catch(() => {});

      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/public",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.query;

      if (id && typeof id === "string") {
        const appointment = await db.query.appointments.findFirst({
          where: eq(schema.appointments.id, id),
          with: {
            client: true,
            colaborador: true,
            services: { with: { service: true } },
          },
        });

        if (!appointment) {
          res.status(404).json({ error: "Cita no encontrada." });
          return;
        }

        res.json(appointment);
        return;
      }

      // Public landing page data
      const [services, colaboradores] = await Promise.all([
        db.query.services.findMany({ where: eq(schema.services.isActive, true) }),
        db.query.colaboradores.findMany({ where: eq(schema.colaboradores.isAvailable, true) }),
      ]);
      const [setting] = await db
        .select()
        .from(schema.settings)
        .where(eq(schema.settings.key, "domicilio_recargo"))
        .limit(1);

      res.json({
        services,
        colaboradores,
        domicilioRecargo: setting?.value ?? "0",
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/available-slots",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { colaboradorId, date, serviceId } = req.query;

      if (!colaboradorId || typeof colaboradorId !== "string") {
        res.status(400).json({ error: "colaboradorId es requerido." });
        return;
      }
      if (!date || typeof date !== "string") {
        res.status(400).json({ error: "date es requerido (YYYY-MM-DD)." });
        return;
      }

      const selectedDate = new Date(date + "T00:00:00-05:00");
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 0) {
        res.json({ slots: [], message: "Domingo no laborable." });
        return;
      }

      let durationMin = SLOT_DURATION_MIN;
      if (serviceId && typeof serviceId === "string") {
        const [svc] = await db
          .select({ durationMin: schema.services.durationMin })
          .from(schema.services)
          .where(eq(schema.services.id, serviceId))
          .limit(1);
        if (svc) durationMin = svc.durationMin;
      }

      const dayStart = new Date(selectedDate);
      dayStart.setHours(BUSINESS_HOURS_START, 0, 0, 0);
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(BUSINESS_HOURS_END, 0, 0, 0);

      const existingAppointments = await db
        .select({ startAt: schema.appointments.startAt, endAt: schema.appointments.endAt })
        .from(schema.appointments)
        .where(
          and(
            eq(schema.appointments.colaboradorId, colaboradorId),
            gte(schema.appointments.startAt, dayStart),
            lte(schema.appointments.startAt, dayEnd),
            sql`status NOT IN ('cancelada')`,
          ),
        );

      function isSlotAvailable(slotStart: Date, slotEnd: Date): boolean {
        return !existingAppointments.some((apt) => {
          const aptStart = new Date(apt.startAt);
          const aptEnd = new Date(apt.endAt);
          return slotStart < aptEnd && slotEnd > aptStart;
        });
      }

      const slots: { start: string; end: string; label: string }[] = [];
      const now = new Date();
      const cursor = new Date(dayStart);

      while (cursor < dayEnd) {
        const slotStart = new Date(cursor);
        const slotEnd = new Date(cursor.getTime() + durationMin * 60_000);

        if (slotEnd > dayEnd) break;

        if (slotStart > now) {
          const label = slotStart.toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            label,
          });
        }

        cursor.setTime(cursor.getTime() + SLOT_DURATION_MIN * 60_000);
      }

      const availableSlots = slots.filter((s) =>
        isSlotAvailable(new Date(s.start), new Date(s.end)),
      );

      res.json({ slots: availableSlots, durationMin });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/public",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = publicCreateSchema.parse(req.body);

      const nameParts = body.clientName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

       const clientEmail = body.clientEmail || undefined;
       const [existingClient] = await db
         .select()
         .from(schema.clients)
         .where(eq(schema.clients.dni, body.clientDni))
         .limit(1);
       let client = existingClient;

       // Si no encontró cliente vinculado, busca por teléfono

      // Si no existe, crea uno nuevo
      if (!client) {
        client = await clientRepo.create({
          firstName,
          lastName,
          dni: body.clientDni,
          phone: body.clientPhone,
          email: clientEmail,
        });
      }

      // Vincular cliente con usuario si no está vinculado y hay email
       if (!client.userId && clientEmail) {
         const [matchingUser] = await db
           .select({ id: schema.users.id })
           .from(schema.users)
           .where(eq(schema.users.email, clientEmail))
           .limit(1);
         if (matchingUser) {
           await db
             .update(schema.clients)
             .set({ userId: matchingUser.id })
             .where(eq(schema.clients.id, client.id));
         }
       }

      const [existing] = await db
        .select({ id: schema.appointments.id })
        .from(schema.appointments)
        .where(
          and(
            eq(schema.appointments.colaboradorId, body.colaboradorId),
            eq(schema.appointments.startAt, new Date(body.startAt)),
            sql`status NOT IN ('cancelada')`,
          ),
        )
        .limit(1);

      if (existing) {
        res.status(409).json({ error: "El horario no está disponible." });
        return;
      }

      const [service] = await db
        .select({ id: schema.services.id, price: schema.services.price, name: schema.services.name, category: schema.services.category })
        .from(schema.services)
        .where(eq(schema.services.id, body.serviceId))
        .limit(1);

      if (!service) {
        res.status(400).json({ error: "Servicio no encontrado." });
        return;
      }

      const [colaborador] = await db
        .select({ fullName: schema.colaboradores.fullName })
        .from(schema.colaboradores)
        .where(eq(schema.colaboradores.id, body.colaboradorId))
        .limit(1);

      const appointment = await appointmentRepo.create({
        clientId: client.id,
        colaboradorId: body.colaboradorId,
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
        totalPrice: service.price,
        notes: body.notes,
        status: "pendiente",
      });

      await db.insert(schema.appointmentServices).values({
        appointmentId: appointment.id,
        serviceId: service.id,
      });

      const [setting] = await db
        .select()
        .from(schema.settings)
        .where(eq(schema.settings.key, "domicilio_recargo"))
        .limit(1);
      const domicilioRecargo = setting?.value ?? "0";

      const datePart = appointment.createdAt ? new Date(appointment.createdAt) : new Date();
const boletaNumber = `B${datePart.toISOString().slice(0, 10).replace(/-/g, "")}-${appointment.id.slice(0, 6).toUpperCase()}`;

      const aptDate = appointment.startAt.toLocaleDateString("es-PE");
      const aptTime = appointment.startAt.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

      sendAppointmentConfirmation(
        client.id,
        body.colaboradorId,
        body.clientName,
        service.name,
        colaborador?.fullName ?? "Especialista",
        aptDate,
        aptTime,
        body.modality ?? "salon",
        service.price,
      ).catch(() => {});

      res.status(201).json({
        appointmentId: appointment.id,
        boletaNumber,
        clientName: body.clientName,
        clientPhone: body.clientPhone,
        serviceName: service.name,
        serviceCategory: service.category,
        colaboradorName: colaborador?.fullName ?? "Especialista",
        startAt: appointment.startAt.toISOString(),
        modality: body.modality,
        basePrice: service.price,
        domicilioRecargo,
        totalPrice: service.price,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "colaborador"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = updateStatusSchema.parse(req.body);

      const [appointment] = await db
        .select()
        .from(schema.appointments)
        .where(eq(schema.appointments.id, req.params.id))
        .limit(1);

      if (!appointment) {
        res.status(404).json({ error: "Cita no encontrada." });
        return;
      }

      const updated = await appointmentRepo.update(req.params.id, { status: body.status });

      if (body.status === "completada") {
        const [colaborador] = await db
          .select({ commissionPct: schema.colaboradores.commissionPct })
          .from(schema.colaboradores)
          .where(eq(schema.colaboradores.id, appointment.colaboradorId))
          .limit(1);

        if (colaborador) {
          const pct = parseFloat(colaborador.commissionPct || "0");
          const amount =
            (parseFloat(appointment.totalPrice) * pct) / 100;

          await db.insert(schema.commissions).values({
            appointmentId: appointment.id,
            colaboradorId: appointment.colaboradorId,
            amount: amount.toString(),
          });

          const [openCaja] = await db
            .select({ id: schema.cashRegisters.id })
            .from(schema.cashRegisters)
            .where(
              and(
                eq(schema.cashRegisters.colaboradorId, appointment.colaboradorId),
                eq(schema.cashRegisters.estado, "abierta"),
              ),
            )
            .limit(1);

          if (openCaja) {
            await db.insert(schema.cashMovements).values({
              cajaId: openCaja.id,
              appointmentId: appointment.id,
              tipo: "ingreso",
              monto: appointment.totalPrice,
              concepto: `Cita completada - ${appointment.id}`,
            });
          }
        }

        // Award loyalty points
        try {
          await earnPoints(appointment.clientId, appointment.id, parseFloat(appointment.totalPrice));
        } catch (err) {
          console.error("[Loyalty] Error awarding points:", err);
        }

        // Send review request
        (async () => {
          try {
            const [clientInfo] = await db
              .select({ firstName: schema.clients.firstName })
              .from(schema.clients)
              .where(eq(schema.clients.id, appointment.clientId))
              .limit(1);

            await sendReviewRequest(
              appointment.clientId,
              appointment.id,
              clientInfo?.firstName ?? "Cliente",
            );
          } catch {}
        })();
      }

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
      const existing = await appointmentRepo.getById(req.params.id);
      if (!existing) {
        res.status(404).json({ error: "Cita no encontrada." });
        return;
      }

      await appointmentRepo.delete(req.params.id);

      res.json({ message: "Cita eliminada correctamente." });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
