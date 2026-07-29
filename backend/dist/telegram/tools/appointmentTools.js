"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultarCitas = consultarCitas;
const db_1 = require("../../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
async function consultarCitas(fecha, colaboradora) {
    const filters = [];
    if (fecha) {
        const start = new Date(fecha + "T00:00:00.000Z");
        const end = new Date(fecha + "T23:59:59.999Z");
        filters.push((0, drizzle_orm_1.gte)(db_1.schema.appointments.startAt, start));
        filters.push((0, drizzle_orm_1.lt)(db_1.schema.appointments.startAt, end));
    }
    if (colaboradora) {
        const colMatch = await db_1.db.query.colaboradores.findFirst({
            where: (0, drizzle_orm_1.ilike)(db_1.schema.colaboradores.fullName, `%${colaboradora}%`),
        });
        if (colMatch) {
            filters.push((0, drizzle_orm_1.eq)(db_1.schema.appointments.colaboradorId, colMatch.id));
        }
    }
    const rows = await db_1.db.query.appointments.findMany({
        where: filters.length > 0 ? (0, drizzle_orm_1.and)(...filters) : undefined,
        with: {
            client: true,
            colaborador: true,
            services: { with: { service: true } },
        },
        orderBy: [(0, drizzle_orm_1.asc)(db_1.schema.appointments.startAt)],
        limit: 30,
    });
    return rows.map((r) => ({
        id: r.id,
        clientName: `${r.client.firstName} ${r.client.lastName}`,
        clientPhone: r.client.phone,
        services: r.services.map((s) => s.service.name),
        colaboradorName: r.colaborador.fullName,
        startAt: r.startAt.toISOString(),
        status: r.status,
        totalPrice: r.totalPrice,
    }));
}
//# sourceMappingURL=appointmentTools.js.map