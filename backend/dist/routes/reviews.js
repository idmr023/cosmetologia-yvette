"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
const createReviewSchema = zod_1.z.object({
    appointmentId: zod_1.z.string().uuid(),
    clientId: zod_1.z.string().uuid().optional(),
    colaboradorId: zod_1.z.string().uuid(),
    serviceId: zod_1.z.string().uuid().optional(),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().max(500).optional(),
});
router.get("/", async (req, res, next) => {
    try {
        const { colaboradorId } = req.query;
        const filters = (0, drizzle_orm_1.eq)(db_1.schema.reviews.isPublic, true);
        const query = db_1.db
            .select()
            .from(db_1.schema.reviews)
            .where(colaboradorId && typeof colaboradorId === "string"
            ? (0, drizzle_orm_1.and)(filters, (0, drizzle_orm_1.eq)(db_1.schema.reviews.colaboradorId, colaboradorId))
            : filters)
            .orderBy((0, drizzle_orm_1.desc)(db_1.schema.reviews.createdAt))
            .limit(50);
        const reviews = await query;
        const ratingStats = await db_1.db
            .select({
            avg: (0, drizzle_orm_1.sql) `AVG(rating)`,
            count: (0, drizzle_orm_1.sql) `COUNT(*)`,
        })
            .from(db_1.schema.reviews)
            .where(filters)
            .then((rows) => rows[0]);
        // Client names for public display
        const enriched = await Promise.all(reviews.map(async (r) => {
            const [client] = await db_1.db
                .select({ firstName: db_1.schema.clients.firstName })
                .from(db_1.schema.clients)
                .where((0, drizzle_orm_1.eq)(db_1.schema.clients.id, r.clientId))
                .limit(1);
            const [colaborador] = await db_1.db
                .select({ fullName: db_1.schema.colaboradores.fullName })
                .from(db_1.schema.colaboradores)
                .where((0, drizzle_orm_1.eq)(db_1.schema.colaboradores.id, r.colaboradorId))
                .limit(1);
            return {
                ...r,
                clientName: client?.firstName ?? "Cliente",
                colaboradorName: colaborador?.fullName ?? "Especialista",
            };
        }));
        res.json({
            data: enriched,
            stats: {
                average: ratingStats?.avg ? Number(ratingStats.avg).toFixed(1) : "0.0",
                total: ratingStats?.count ?? 0,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("cliente"), async (req, res, next) => {
    try {
        const body = createReviewSchema.parse(req.body);
        const clientId = req.user?.clientId;
        if (!clientId) {
            res.status(400).json({ error: "No se encontró cliente vinculado." });
            return;
        }
        const [existing] = await db_1.db
            .select({ id: db_1.schema.reviews.id })
            .from(db_1.schema.reviews)
            .where((0, drizzle_orm_1.eq)(db_1.schema.reviews.appointmentId, body.appointmentId))
            .limit(1);
        if (existing) {
            res.status(409).json({ error: "Esta cita ya tiene una reseña." });
            return;
        }
        const [review] = await db_1.db
            .insert(db_1.schema.reviews)
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
    }
    catch (error) {
        next(error);
    }
});
router.patch("/:id/toggle-visibility", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const [review] = await db_1.db
            .select({ isPublic: db_1.schema.reviews.isPublic })
            .from(db_1.schema.reviews)
            .where((0, drizzle_orm_1.eq)(db_1.schema.reviews.id, req.params.id))
            .limit(1);
        if (!review) {
            res.status(404).json({ error: "Reseña no encontrada." });
            return;
        }
        const [updated] = await db_1.db
            .update(db_1.schema.reviews)
            .set({ isPublic: !review.isPublic })
            .where((0, drizzle_orm_1.eq)(db_1.schema.reviews.id, req.params.id))
            .returning();
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        await db_1.db.delete(db_1.schema.reviews).where((0, drizzle_orm_1.eq)(db_1.schema.reviews.id, req.params.id));
        res.json({ message: "Reseña eliminada." });
    }
    catch (error) {
        next(error);
    }
});
router.get("/eligible", auth_1.authenticate, (0, auth_1.authorize)("cliente"), async (req, res, next) => {
    try {
        const clientId = req.user?.clientId;
        if (!clientId) {
            res.status(400).json({ error: "No se encontró cliente vinculado." });
            return;
        }
        const eligible = await db_1.db
            .select({
            id: db_1.schema.appointments.id,
            startAt: db_1.schema.appointments.startAt,
            colaboradorId: db_1.schema.appointments.colaboradorId,
            colaboradorName: db_1.schema.colaboradores.fullName,
            serviceName: db_1.schema.services.name,
            serviceId: db_1.schema.services.id,
        })
            .from(db_1.schema.appointments)
            .innerJoin(db_1.schema.colaboradores, (0, drizzle_orm_1.eq)(db_1.schema.colaboradores.id, db_1.schema.appointments.colaboradorId))
            .innerJoin(db_1.schema.appointmentServices, (0, drizzle_orm_1.eq)(db_1.schema.appointmentServices.appointmentId, db_1.schema.appointments.id))
            .innerJoin(db_1.schema.services, (0, drizzle_orm_1.eq)(db_1.schema.services.id, db_1.schema.appointmentServices.serviceId))
            .leftJoin(db_1.schema.reviews, (0, drizzle_orm_1.eq)(db_1.schema.reviews.appointmentId, db_1.schema.appointments.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.appointments.clientId, clientId), (0, drizzle_orm_1.eq)(db_1.schema.appointments.status, "completada"), (0, drizzle_orm_1.sql) `${db_1.schema.reviews.id} IS NULL`))
            .orderBy((0, drizzle_orm_1.desc)(db_1.schema.appointments.startAt))
            .limit(50);
        res.json({ data: eligible });
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
        const reviews = await db_1.db
            .select()
            .from(db_1.schema.reviews)
            .where((0, drizzle_orm_1.eq)(db_1.schema.reviews.clientId, clientId))
            .orderBy((0, drizzle_orm_1.desc)(db_1.schema.reviews.createdAt))
            .limit(50);
        const enriched = await Promise.all(reviews.map(async (r) => {
            const [colaborador] = await db_1.db
                .select({ fullName: db_1.schema.colaboradores.fullName })
                .from(db_1.schema.colaboradores)
                .where((0, drizzle_orm_1.eq)(db_1.schema.colaboradores.id, r.colaboradorId))
                .limit(1);
            return {
                ...r,
                colaboradorName: colaborador?.fullName ?? "Especialista",
            };
        }));
        res.json({ data: enriched });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=reviews.js.map