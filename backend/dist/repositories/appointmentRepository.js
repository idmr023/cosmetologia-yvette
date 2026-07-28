"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentRepository = void 0;
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
class AppointmentRepository {
    async getAll() {
        const rows = await db_1.db.query.appointments.findMany({
            with: {
                client: true,
                colaborador: true,
                services: { with: { service: true } },
            },
            orderBy: [(0, drizzle_orm_1.desc)(db_1.schema.appointments.startAt)],
        });
        return rows.map((r) => ({
            id: r.id,
            clientName: `${r.client.firstName} ${r.client.lastName}`,
            clientPhone: r.client.phone,
            services: r.services.map((s) => s.service.name),
            colaboradorName: r.colaborador.fullName,
            startAt: r.startAt,
            status: r.status,
            totalPrice: r.totalPrice,
        }));
    }
    async getById(id) {
        const row = await db_1.db.query.appointments.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.schema.appointments.id, id),
            with: {
                client: true,
                colaborador: true,
                services: { with: { service: true } },
            },
        });
        if (!row)
            return null;
        const r = row;
        return {
            id: r.id,
            clientName: `${r.client.firstName} ${r.client.lastName}`,
            clientPhone: r.client.phone,
            services: r.services.map((s) => s.service.name),
            colaboradorName: r.colaborador.fullName,
            startAt: r.startAt,
            status: r.status,
            totalPrice: r.totalPrice,
        };
    }
    async create(data) {
        const [created] = await db_1.db.insert(db_1.schema.appointments).values(data).returning();
        return created;
    }
    async update(id, data) {
        const [updated] = await db_1.db
            .update(db_1.schema.appointments)
            .set(data)
            .where((0, drizzle_orm_1.eq)(db_1.schema.appointments.id, id))
            .returning();
        return updated;
    }
    async delete(id) {
        await db_1.db.delete(db_1.schema.appointments).where((0, drizzle_orm_1.eq)(db_1.schema.appointments.id, id));
    }
}
exports.AppointmentRepository = AppointmentRepository;
//# sourceMappingURL=appointmentRepository.js.map