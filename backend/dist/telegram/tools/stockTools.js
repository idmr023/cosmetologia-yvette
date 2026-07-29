"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultarStock = consultarStock;
const db_1 = require("../../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
async function consultarStock(producto) {
    const items = await db_1.db.query.inventory.findMany({
        where: producto ? (0, drizzle_orm_1.ilike)(db_1.schema.inventory.name, `%${producto}%`) : undefined,
        orderBy: [(0, drizzle_orm_1.asc)(db_1.schema.inventory.name)],
        limit: 50,
    });
    return items.map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        category: i.category,
        stockQty: i.stockQty,
        minStock: i.minStock,
        unitPrice: i.unitPrice,
        supplier: i.supplier,
    }));
}
//# sourceMappingURL=stockTools.js.map