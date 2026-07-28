"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const appointmentRepository_1 = require("../repositories/appointmentRepository");
const clientRepository_1 = require("../repositories/clientRepository");
const loyalty_1 = require("./loyalty");
const notifications_1 = require("../lib/notifications");
const router = (0, express_1.Router)();
const appointmentRepo = new appointmentRepository_1.AppointmentRepository();
const clientRepo = new clientRepository_1.ClientRepository();
const createSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid(),
    colaboradorId: zod_1.z.string().uuid(),
    startAt: zod_1.z.string().datetime(),
    endAt: zod_1.z.string().datetime(),
    serviceIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, "Al menos un servicio."),
    notes: zod_1.z.string().optional(),
});
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["pendiente", "confirmada", "completada", "cancelada"]),
});
const publicCreateSchema = zod_1.z.object({
    clientName: zod_1.z.string().min(1, "Nombre es requerido"),
    clientDni: zod_1.z.string().regex(/^\d{8}$/),
    clientPhone: zod_1.z.string().min(6, "Teléfono es requerido"),
    clientEmail: zod_1.z.string().email().optional().or(zod_1.z.literal("")),
    serviceId: zod_1.z.string().uuid(),
    colaboradorId: zod_1.z.string().uuid(),
    startAt: zod_1.z.string().datetime(),
    endAt: zod_1.z.string().datetime(),
    modality: zod_1.z.enum(["salon", "domicilio"]).optional().default("salon"),
    notes: zod_1.z.string().optional(),
});
const SLOT_DURATION_MIN = 30;
const BUSINESS_HOURS_START = 9;
const BUSINESS_HOURS_END = 19;
const MAX_ADVANCE_DAYS = 30;
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const offset = Number(req.query.offset) || 0;
        const limit = Number(req.query.limit) || 50;
        const appointments = await db_1.db.query.appointments.findMany({
            with: {
                client: true,
                colaborador: true,
                services: { with: { service: true } },
            },
            orderBy: (a, { desc }) => [desc(a.startAt)],
            limit,
            offset,
        });
        const [row] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(db_1.schema.appointments);
        const total = Number(row.count);
        res.json({ data: appointments, total, offset, limit });
    }
    catch (error) {
        next(error);
    }
});
router.get("/mine", auth_1.authenticate, (0, auth_1.authorize)("cliente"), async (req, res, next) => {
    try {
        const clientId = req.user?.clientId;
        if (!clientId) {
            res.status(400).json({ error: "No se encontró cliente vinculado." });
            return;
        }
        const appointments = await db_1.db.query.appointments.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.schema.appointments.clientId, clientId),
            with: {
                client: true,
                colaborador: true,
                services: { with: { service: true } },
            },
            orderBy: (a, { desc }) => [desc(a.startAt)],
            limit: 50,
        });
        res.json({ data: appointments });
    }
    catch (error) {
        next(error);
    }
});
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const body = createSchema.parse(req.body);
        const services = await db_1.db
            .select({ id: db_1.schema.services.id, price: db_1.schema.services.price })
            .from(db_1.schema.services)
            .where((0, drizzle_orm_1.inArray)(db_1.schema.services.id, body.serviceIds));
        const totalPrice = services.reduce((sum, s) => sum + parseFloat(s.price), 0);
        const appointment = await appointmentRepo.create({
            clientId: body.clientId,
            colaboradorId: body.colaboradorId,
            startAt: new Date(body.startAt),
            endAt: new Date(body.endAt),
            totalPrice: totalPrice.toString(),
            notes: body.notes,
        });
        await db_1.db.insert(db_1.schema.appointmentServices).values(body.serviceIds.map((serviceId) => ({
            appointmentId: appointment.id,
            serviceId,
        })));
        const [serviceNames] = await db_1.db
            .select({ name: db_1.schema.services.name })
            .from(db_1.schema.services)
            .where((0, drizzle_orm_1.inArray)(db_1.schema.services.id, body.serviceIds))
            .limit(1);
        const [clientData] = await db_1.db
            .select({ firstName: db_1.schema.clients.firstName, lastName: db_1.schema.clients.lastName })
            .from(db_1.schema.clients)
            .where((0, drizzle_orm_1.eq)(db_1.schema.clients.id, body.clientId))
            .limit(1);
        const [colaboradorData] = await db_1.db
            .select({ fullName: db_1.schema.colaboradores.fullName })
            .from(db_1.schema.colaboradores)
            .where((0, drizzle_orm_1.eq)(db_1.schema.colaboradores.id, body.colaboradorId))
            .limit(1);
        const startDate = new Date(body.startAt);
        const aptDate = startDate.toLocaleDateString("es-PE");
        const aptTime = startDate.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
        (0, notifications_1.sendAppointmentConfirmation)(body.clientId, body.colaboradorId, clientData ? `${clientData.firstName} ${clientData.lastName}`.trim() : "Cliente", serviceNames?.name ?? "Servicio", colaboradorData?.fullName ?? "Especialista", aptDate, aptTime, "salon", totalPrice.toString()).catch(() => { });
        res.status(201).json(appointment);
    }
    catch (error) {
        next(error);
    }
});
router.get("/public", async (req, res, next) => {
    try {
        const { id } = req.query;
        if (id && typeof id === "string") {
            const appointment = await db_1.db.query.appointments.findFirst({
                where: (0, drizzle_orm_1.eq)(db_1.schema.appointments.id, id),
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
            db_1.db.query.services.findMany({ where: (0, drizzle_orm_1.eq)(db_1.schema.services.isActive, true) }),
            db_1.db.query.colaboradores.findMany({ where: (0, drizzle_orm_1.eq)(db_1.schema.colaboradores.isAvailable, true) }),
        ]);
        const [setting] = await db_1.db
            .select()
            .from(db_1.schema.settings)
            .where((0, drizzle_orm_1.eq)(db_1.schema.settings.key, "domicilio_recargo"))
            .limit(1);
        res.json({
            services,
            colaboradores,
            domicilioRecargo: setting?.value ?? "0",
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/available-slots", async (req, res, next) => {
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
            const [svc] = await db_1.db
                .select({ durationMin: db_1.schema.services.durationMin })
                .from(db_1.schema.services)
                .where((0, drizzle_orm_1.eq)(db_1.schema.services.id, serviceId))
                .limit(1);
            if (svc)
                durationMin = svc.durationMin;
        }
        const dayStart = new Date(selectedDate);
        dayStart.setHours(BUSINESS_HOURS_START, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(BUSINESS_HOURS_END, 0, 0, 0);
        const existingAppointments = await db_1.db
            .select({ startAt: db_1.schema.appointments.startAt, endAt: db_1.schema.appointments.endAt })
            .from(db_1.schema.appointments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.appointments.colaboradorId, colaboradorId), (0, drizzle_orm_1.gte)(db_1.schema.appointments.startAt, dayStart), (0, drizzle_orm_1.lte)(db_1.schema.appointments.startAt, dayEnd), (0, drizzle_orm_1.sql) `status NOT IN ('cancelada')`));
        function isSlotAvailable(slotStart, slotEnd) {
            return !existingAppointments.some((apt) => {
                const aptStart = new Date(apt.startAt);
                const aptEnd = new Date(apt.endAt);
                return slotStart < aptEnd && slotEnd > aptStart;
            });
        }
        const slots = [];
        const now = new Date();
        const cursor = new Date(dayStart);
        while (cursor < dayEnd) {
            const slotStart = new Date(cursor);
            const slotEnd = new Date(cursor.getTime() + durationMin * 60_000);
            if (slotEnd > dayEnd)
                break;
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
        const availableSlots = slots.filter((s) => isSlotAvailable(new Date(s.start), new Date(s.end)));
        res.json({ slots: availableSlots, durationMin });
    }
    catch (error) {
        next(error);
    }
});
router.post("/public", async (req, res, next) => {
    try {
        const body = publicCreateSchema.parse(req.body);
        const nameParts = body.clientName.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || firstName;
        const clientEmail = body.clientEmail || undefined;
        const [existingClient] = await db_1.db
            .select()
            .from(db_1.schema.clients)
            .where((0, drizzle_orm_1.eq)(db_1.schema.clients.dni, body.clientDni))
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
            const [matchingUser] = await db_1.db
                .select({ id: db_1.schema.users.id })
                .from(db_1.schema.users)
                .where((0, drizzle_orm_1.eq)(db_1.schema.users.email, clientEmail))
                .limit(1);
            if (matchingUser) {
                await db_1.db
                    .update(db_1.schema.clients)
                    .set({ userId: matchingUser.id })
                    .where((0, drizzle_orm_1.eq)(db_1.schema.clients.id, client.id));
            }
        }
        const [existing] = await db_1.db
            .select({ id: db_1.schema.appointments.id })
            .from(db_1.schema.appointments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.appointments.colaboradorId, body.colaboradorId), (0, drizzle_orm_1.eq)(db_1.schema.appointments.startAt, new Date(body.startAt)), (0, drizzle_orm_1.sql) `status NOT IN ('cancelada')`))
            .limit(1);
        if (existing) {
            res.status(409).json({ error: "El horario no está disponible." });
            return;
        }
        const [service] = await db_1.db
            .select({ id: db_1.schema.services.id, price: db_1.schema.services.price, name: db_1.schema.services.name, category: db_1.schema.services.category })
            .from(db_1.schema.services)
            .where((0, drizzle_orm_1.eq)(db_1.schema.services.id, body.serviceId))
            .limit(1);
        if (!service) {
            res.status(400).json({ error: "Servicio no encontrado." });
            return;
        }
        const [colaborador] = await db_1.db
            .select({ fullName: db_1.schema.colaboradores.fullName })
            .from(db_1.schema.colaboradores)
            .where((0, drizzle_orm_1.eq)(db_1.schema.colaboradores.id, body.colaboradorId))
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
        await db_1.db.insert(db_1.schema.appointmentServices).values({
            appointmentId: appointment.id,
            serviceId: service.id,
        });
        const [setting] = await db_1.db
            .select()
            .from(db_1.schema.settings)
            .where((0, drizzle_orm_1.eq)(db_1.schema.settings.key, "domicilio_recargo"))
            .limit(1);
        const domicilioRecargo = setting?.value ?? "0";
        const datePart = appointment.createdAt ? new Date(appointment.createdAt) : new Date();
        const boletaNumber = `B${datePart.toISOString().slice(0, 10).replace(/-/g, "")}-${appointment.id.slice(0, 6).toUpperCase()}`;
        const aptDate = appointment.startAt.toLocaleDateString("es-PE");
        const aptTime = appointment.startAt.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
        (0, notifications_1.sendAppointmentConfirmation)(client.id, body.colaboradorId, body.clientName, service.name, colaborador?.fullName ?? "Especialista", aptDate, aptTime, body.modality ?? "salon", service.price).catch(() => { });
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
    }
    catch (error) {
        next(error);
    }
});
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const body = updateStatusSchema.parse(req.body);
        const [appointment] = await db_1.db
            .select()
            .from(db_1.schema.appointments)
            .where((0, drizzle_orm_1.eq)(db_1.schema.appointments.id, req.params.id))
            .limit(1);
        if (!appointment) {
            res.status(404).json({ error: "Cita no encontrada." });
            return;
        }
        const updated = await appointmentRepo.update(req.params.id, { status: body.status });
        if (body.status === "completada") {
            const [colaborador] = await db_1.db
                .select({ commissionPct: db_1.schema.colaboradores.commissionPct })
                .from(db_1.schema.colaboradores)
                .where((0, drizzle_orm_1.eq)(db_1.schema.colaboradores.id, appointment.colaboradorId))
                .limit(1);
            if (colaborador) {
                const pct = parseFloat(colaborador.commissionPct || "0");
                const amount = (parseFloat(appointment.totalPrice) * pct) / 100;
                await db_1.db.insert(db_1.schema.commissions).values({
                    appointmentId: appointment.id,
                    colaboradorId: appointment.colaboradorId,
                    amount: amount.toString(),
                });
                const [openCaja] = await db_1.db
                    .select({ id: db_1.schema.cashRegisters.id })
                    .from(db_1.schema.cashRegisters)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.cashRegisters.colaboradorId, appointment.colaboradorId), (0, drizzle_orm_1.eq)(db_1.schema.cashRegisters.estado, "abierta")))
                    .limit(1);
                if (openCaja) {
                    await db_1.db.insert(db_1.schema.cashMovements).values({
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
                await (0, loyalty_1.earnPoints)(appointment.clientId, appointment.id, parseFloat(appointment.totalPrice));
            }
            catch (err) {
                console.error("[Loyalty] Error awarding points:", err);
            }
            // Send review request
            (async () => {
                try {
                    const [clientInfo] = await db_1.db
                        .select({ firstName: db_1.schema.clients.firstName })
                        .from(db_1.schema.clients)
                        .where((0, drizzle_orm_1.eq)(db_1.schema.clients.id, appointment.clientId))
                        .limit(1);
                    await (0, notifications_1.sendReviewRequest)(appointment.clientId, appointment.id, clientInfo?.firstName ?? "Cliente");
                }
                catch { }
            })();
        }
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const existing = await appointmentRepo.getById(req.params.id);
        if (!existing) {
            res.status(404).json({ error: "Cita no encontrada." });
            return;
        }
        await appointmentRepo.delete(req.params.id);
        res.json({ message: "Cita eliminada correctamente." });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=appointments.js.map