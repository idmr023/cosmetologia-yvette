import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { db, schema } from "../lib/db";
import { eq, sql } from "drizzle-orm";
import { ClientRepository } from "../repositories/clientRepository";

const router = Router();
const repo = new ClientRepository();

const createSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido."),
  lastName: z.string().min(1, "Apellido requerido."),
  phone: z.string().min(1, "Teléfono requerido."),
  dni: z.string().regex(/^\d{8}$/),
  email: z.string().email().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  dni: z.string().regex(/^\d{8}$/).optional(),
  email: z.string().email().optional().nullable(),
  notes: z.string().optional().nullable(),
});

router.get(
  "/",
  authenticate,
  authorize("admin", "colaborador"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offset = Number(req.query.offset) || 0;
      const limit = Number(req.query.limit) || 50;
      const clients = await db.query.clients.findMany({
        orderBy: (c, { desc }) => [desc(c.createdAt)],
        limit,
        offset,
      });
      const [row] = await db.select({ count: sql<string>`count(*)` }).from(schema.clients);
      const total = Number(row.count);
      res.json({ data: clients, total, offset, limit });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/me",
  authenticate,
  authorize("cliente"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = req.user?.clientId;
      if (!clientId) {
        res.status(400).json({ error: "No se encontró cliente vinculado." });
        return;
      }

      const [client] = await db
        .select()
        .from(schema.clients)
        .where(eq(schema.clients.id, clientId))
        .limit(1);

      if (!client) {
        res.status(404).json({ error: "Cliente no encontrado." });
        return;
      }

      res.json(client);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/me",
  authenticate,
  authorize("cliente"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = req.user?.clientId;
      if (!clientId) {
        res.status(400).json({ error: "No se encontró cliente vinculado." });
        return;
      }

      const body = updateSchema.parse(req.body);

      if (body.dni) {
        const existing = await db
          .select({ id: schema.clients.id })
          .from(schema.clients)
          .where(eq(schema.clients.dni, body.dni));

        if (existing.length > 0 && existing[0].id !== clientId) {
          res.status(409).json({ error: "El DNI ya está en uso." });
          return;
        }
      }

      const updated = await repo.update(clientId, body);

      if (!updated) {
        res.status(404).json({ error: "Cliente no encontrado." });
        return;
      }

      res.json(updated);
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
      const body = createSchema.parse(req.body);

      const existing = await db
        .select({ id: schema.clients.id })
        .from(schema.clients)
        .where(eq(schema.clients.dni, body.dni))
        .limit(1);

      if (existing.length > 0) {
        res.status(409).json({ error: "El DNI ya está registrado." });
        return;
      }

      const client = await repo.create(body);

      res.status(201).json(client);
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
      const body = updateSchema.parse(req.body);

      if (body.dni) {
        const existing = await db
          .select({ id: schema.clients.id })
          .from(schema.clients)
          .where(
            eq(schema.clients.dni, body.dni),
          );

        if (
          existing.length > 0 &&
          existing[0].id !== req.params.id
        ) {
          res.status(409).json({ error: "El DNI ya está en uso." });
          return;
        }
      }

      const updated = await repo.update(req.params.id, body);

      if (!updated) {
        res.status(404).json({ error: "Cliente no encontrado." });
        return;
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await repo.delete(req.params.id);

      res.json({ message: "Cliente eliminado correctamente." });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:id/history",
  authenticate,
  authorize("admin", "colaborador"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offset = Number(req.query.offset) || 0;
      const limit = Number(req.query.limit) || 50;
      const history = await repo.getHistory(req.params.id);
      const total = history.length;
      res.json({ data: history.slice(offset, offset + limit), total, offset, limit });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
