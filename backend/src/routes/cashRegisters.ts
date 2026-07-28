import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { db, schema } from "../lib/db";
import { eq, and, sql } from "drizzle-orm";
import { CashRegisterRepository } from "../repositories/cashRegisterRepository";

const router = Router();
const repo = new CashRegisterRepository();

const openSchema = z.object({
  colaboradorId: z.string().uuid(),
  montoInicial: z.string().regex(/^\d+(\.\d{1,2})?$/, "Monto inválido."),
  notas: z.string().optional().nullable(),
});

const closeSchema = z.object({
  montoReal: z.string().regex(/^\d+(\.\d{1,2})?$/, "Monto inválido."),
  notas: z.string().optional().nullable(),
});

const movementSchema = z.object({
  tipo: z.enum(["ingreso", "egreso"]),
  monto: z.string().regex(/^\d+(\.\d{1,2})?$/, "Monto inválido."),
  concepto: z.string().min(1, "Concepto requerido."),
});

router.get(
  "/",
  authenticate,
  authorize("admin", "colaborador"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { estado } = req.query;
      const offset = Number(req.query.offset) || 0;
      const limit = Number(req.query.limit) || 50;
      const conditions = [];

      if (estado && typeof estado === "string") {
        conditions.push(eq(schema.cashRegisters.estado, estado));
      }

      const where =
        req.user?.role === "admin"
          ? conditions.length > 0
            ? and(...conditions)
            : undefined
          : and(
              eq(schema.cashRegisters.colaboradorId, req.user!.colaboradorId!),
              ...conditions,
            );

      const registers = await db.query.cashRegisters.findMany({
        where,
        with: { colaborador: true },
        orderBy: (r, { desc }) => [desc(r.apertura)],
        limit,
        offset,
      });

      const [row] = where
        ? await db.select({ count: sql<string>`count(*)` }).from(schema.cashRegisters).where(where)
        : await db.select({ count: sql<string>`count(*)` }).from(schema.cashRegisters);
      const total = Number(row.count);
      res.json({ data: registers, total, offset, limit });
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
      const body = openSchema.parse(req.body);

      const colaboradorId =
        req.user?.role === "admin"
          ? body.colaboradorId
          : req.user!.colaboradorId!;

      const [open] = await db
        .select({ id: schema.cashRegisters.id })
        .from(schema.cashRegisters)
        .where(
          and(
            eq(schema.cashRegisters.colaboradorId, colaboradorId),
            eq(schema.cashRegisters.estado, "abierta"),
          ),
        )
        .limit(1);

      if (open) {
        res.status(409).json({ error: "Ya hay una caja abierta." });
        return;
      }

      const register = await repo.create({
        colaboradorId,
        montoInicial: body.montoInicial,
        notas: body.notas,
      });

      res.status(201).json(register);
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
      const body = closeSchema.parse(req.body);

      const [caja] = await db
        .select()
        .from(schema.cashRegisters)
        .where(eq(schema.cashRegisters.id, req.params.id))
        .limit(1);

      if (!caja) {
        res.status(404).json({ error: "Caja no encontrada." });
        return;
      }

      if (caja.estado !== "abierta") {
        res.status(400).json({ error: "La caja ya está cerrada." });
        return;
      }

      const movements = await db
        .select({
          tipo: schema.cashMovements.tipo,
          monto: schema.cashMovements.monto,
        })
        .from(schema.cashMovements)
        .where(eq(schema.cashMovements.cajaId, caja.id));

      let expected = parseFloat(caja.montoInicial);
      for (const m of movements) {
        const amount = parseFloat(m.monto);
        if (m.tipo === "ingreso") {
          expected += amount;
        } else {
          expected -= amount;
        }
      }

      const real = parseFloat(body.montoReal);
      const diferencia = real - expected;

      const [updated] = await db
        .update(schema.cashRegisters)
        .set({
          cierre: new Date(),
          montoEsperado: expected.toString(),
          montoReal: body.montoReal,
          diferencia: diferencia.toString(),
          estado: "cerrada",
          notas: body.notas || caja.notas,
        })
        .where(eq(schema.cashRegisters.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:id/movements",
  authenticate,
  authorize("admin", "colaborador"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offset = Number(req.query.offset) || 0;
      const limit = Number(req.query.limit) || 50;
      const movements = await repo.getMovements(req.params.id);
      const total = movements.length;
      res.json({ data: movements.slice(offset, offset + limit), total, offset, limit });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/:id/movements",
  authenticate,
  authorize("admin", "colaborador"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = movementSchema.parse(req.body);

      const [caja] = await db
        .select({ id: schema.cashRegisters.id, estado: schema.cashRegisters.estado })
        .from(schema.cashRegisters)
        .where(eq(schema.cashRegisters.id, req.params.id))
        .limit(1);

      if (!caja) {
        res.status(404).json({ error: "Caja no encontrada." });
        return;
      }

      if (caja.estado !== "abierta") {
        res.status(400).json({ error: "La caja está cerrada." });
        return;
      }

      const movement = await repo.addMovement(req.params.id, {
        tipo: body.tipo,
        monto: body.monto,
        concepto: body.concepto,
      });

      res.status(201).json(movement);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
