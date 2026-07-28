import { Router, Request, Response, NextFunction } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { CommissionRepository } from "../repositories/commissionRepository";

const router = Router();
const repo = new CommissionRepository();

router.get(
  "/",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await repo.pay(req.params.id);

      if (!updated) {
        res.status(404).json({ error: "Comisión no encontrada." });
        return;
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
