"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultarServicios = consultarServicios;
const db_1 = require("../../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
async function consultarServicios() {
    const services = await db_1.db.query.services.findMany({
        where: (0, drizzle_orm_1.eq)(db_1.schema.services.isActive, true),
        orderBy: [(0, drizzle_orm_1.asc)(db_1.schema.services.name)],
    });
    return services.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        durationMin: s.durationMin,
        price: s.price,
        description: s.description,
    }));
}
//# sourceMappingURL=serviceTools.js.map