"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const commissionRepository_1 = require("../repositories/commissionRepository");
const router = (0, express_1.Router)();
const repo = new commissionRepository_1.CommissionRepository();
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const { desde, hasta, colaboradorId } = req.query;
        const offset = Number(req.query.offset) || 0;
        const limit = Number(req.query.limit) || 50;
        const commissions = await repo.getAll({
            desde: typeof desde === "string" ? desde : undefined,
            hasta: typeof hasta === "string" ? hasta : undefined,
            colaboradorId: typeof colaboradorId === "string" ? colaboradorId : undefined,
        });
        const total = commissions.length;
        res.json({ data: commissions.slice(offset, offset + limit), total, offset, limit });
    }
    catch (error) {
        next(error);
    }
});
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const updated = await repo.pay(req.params.id);
        if (!updated) {
            res.status(404).json({ error: "Comisión no encontrada." });
            return;
        }
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=commissions.js.map