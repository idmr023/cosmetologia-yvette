"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
router.get("/", async (req, res, next) => {
    try {
        const { category } = req.query;
        const filters = (0, drizzle_orm_1.eq)(db_1.schema.inventory.type, "venta");
        const where = category && typeof category === "string"
            ? (0, drizzle_orm_1.and)(filters, (0, drizzle_orm_1.eq)(db_1.schema.inventory.category, category))
            : filters;
        const products = await db_1.db
            .select()
            .from(db_1.schema.inventory)
            .where(where)
            .orderBy(db_1.schema.inventory.name);
        const categories = await db_1.db
            .select({ category: db_1.schema.inventory.category })
            .from(db_1.schema.inventory)
            .where(filters)
            .groupBy(db_1.schema.inventory.category);
        res.json({
            data: products.filter((p) => p.stockQty > 0),
            categories: categories.map((c) => c.category).filter(Boolean),
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/:id", async (req, res, next) => {
    try {
        const [product] = await db_1.db
            .select()
            .from(db_1.schema.inventory)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.inventory.id, req.params.id), (0, drizzle_orm_1.eq)(db_1.schema.inventory.type, "venta")))
            .limit(1);
        if (!product) {
            res.status(404).json({ error: "Producto no encontrado." });
            return;
        }
        res.json(product);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map