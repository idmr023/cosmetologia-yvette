import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { db, schema } from "../lib/db";
import { eq, and, desc, inArray, sql } from "drizzle-orm";

const router = Router();

const clientInfoSchema = z.object({
  clientDni: z.string().regex(/^\d{8}$/, "DNI debe tener 8 dígitos"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  phone: z.string().min(6, "Teléfono requerido"),
  email: z.string().email().optional().or(z.literal("")),
});

const createOrderSchema = z.object({
  items: z.array(z.object({
    inventoryId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
  deliveryMethod: z.enum(["recojo", "delivery"]).optional().default("recojo"),
  shippingAddress: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["yape", "plin", "efectivo", "transferencia", "mercadopago"]).optional(),
}).and(z.union([
  z.object({ clientId: z.string().uuid() }),
  clientInfoSchema,
]));

router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createOrderSchema.parse(req.body);

      let clientId = (body as any).clientId;
      if (!clientId) {
        const info = body as z.infer<typeof clientInfoSchema>;
        let client = await db
          .select()
          .from(schema.clients)
          .where(eq(schema.clients.dni, info.clientDni))
          .limit(1)
          .then((rows) => rows[0]);

        if (!client) {
          [client] = await db
            .insert(schema.clients)
            .values({
              firstName: info.firstName,
              lastName: info.lastName,
              dni: info.clientDni,
              phone: info.phone,
              email: info.email || undefined,
            })
            .returning();
        }
        clientId = client.id;
      }

      const productIds = body.items.map((i) => i.inventoryId);
      const products = await db
        .select()
        .from(schema.inventory)
        .where(inArray(schema.inventory.id, productIds));

      if (products.length !== productIds.length) {
        res.status(400).json({ error: "Algunos productos no existen." });
        return;
      }

      for (const item of body.items) {
        const product = products.find((p) => p.id === item.inventoryId);
        if (!product || product.stockQty < item.quantity) {
          res.status(400).json({
            error: `Stock insuficiente para "${product?.name ?? item.inventoryId}". Disponible: ${product?.stockQty ?? 0}`,
          });
          return;
        }
      }

      const totalAmount = body.items.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.inventoryId);
        return sum + (product ? parseFloat(product.unitPrice ?? "0") * item.quantity : 0);
      }, 0);

      const [order] = await db
        .insert(schema.orders)
        .values({
          clientId,
          totalAmount: totalAmount.toFixed(2),
          deliveryMethod: body.deliveryMethod,
          shippingAddress: body.shippingAddress,
          notes: body.notes,
          paymentMethod: body.paymentMethod ?? null,
        })
        .returning();

      await db.insert(schema.orderItems).values(
        body.items.map((item) => {
          const product = products.find((p) => p.id === item.inventoryId);
          return {
            orderId: order.id,
            inventoryId: item.inventoryId,
            quantity: item.quantity,
            unitPrice: product?.unitPrice ?? "0",
          };
        }),
      );

      for (const item of body.items) {
        await db
          .update(schema.inventory)
          .set({ stockQty: sql`stock_qty - ${item.quantity}` })
          .where(eq(schema.inventory.id, item.inventoryId));
      }

      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/",
  authenticate,
  authorize("admin", "colaborador"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { clientId } = req.query;
      const filters = clientId && typeof clientId === "string"
        ? eq(schema.orders.clientId, clientId)
        : undefined;

      const orders = await db
        .select()
        .from(schema.orders)
        .where(filters)
        .orderBy(desc(schema.orders.createdAt))
        .limit(50);

      const enriched = await Promise.all(
        orders.map(async (order) => {
          const items = await db
            .select()
            .from(schema.orderItems)
            .where(eq(schema.orderItems.orderId, order.id));

          const client = await db
            .select({ firstName: schema.clients.firstName, lastName: schema.clients.lastName })
            .from(schema.clients)
            .where(eq(schema.clients.id, order.clientId))
            .limit(1)
            .then((r) => r[0]);

          return { ...order, items, clientName: client ? `${client.firstName} ${client.lastName}` : "—" };
        }),
      );

      res.json({ data: enriched });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/mine",
  authenticate,
  authorize("cliente"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = req.user?.clientId;
      if (!clientId) {
        res.status(400).json({ error: "No se encontró cliente vinculado." });
        return;
      }

      const orders = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.clientId, clientId))
        .orderBy(desc(schema.orders.createdAt))
        .limit(50);

      const enriched = await Promise.all(
        orders.map(async (order) => {
          const items = await db
            .select()
            .from(schema.orderItems)
            .where(eq(schema.orderItems.orderId, order.id));

          const products = items.length > 0
            ? await db
                .select({ id: schema.inventory.id, name: schema.inventory.name })
                .from(schema.inventory)
                .where(inArray(schema.inventory.id, items.map((i) => i.inventoryId)))
            : [];

          const enrichedItems = items.map((item) => ({
            ...item,
            name: products.find((p) => p.id === item.inventoryId)?.name ?? "Producto",
          }));

          return { ...order, items: enrichedItems };
        }),
      );

      res.json({ data: enriched });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [order] = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.id, req.params.id))
        .limit(1);

      if (!order) {
        res.status(404).json({ error: "Pedido no encontrado." });
        return;
      }

      const items = await db
        .select()
        .from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, order.id));

      const products = items.length > 0
        ? await db
            .select({ id: schema.inventory.id, name: schema.inventory.name })
            .from(schema.inventory)
            .where(inArray(schema.inventory.id, items.map((i) => i.inventoryId)))
        : [];

      const enrichedItems = items.map((item) => ({
        ...item,
        name: products.find((p) => p.id === item.inventoryId)?.name ?? "Producto",
      }));

      const client = await db
        .select({ firstName: schema.clients.firstName, lastName: schema.clients.lastName, phone: schema.clients.phone })
        .from(schema.clients)
        .where(eq(schema.clients.id, order.clientId))
        .limit(1)
        .then((r) => r[0]);

      res.json({ ...order, items: enrichedItems, clientName: client ? `${client.firstName} ${client.lastName}` : "—", clientPhone: client?.phone });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = z.object({
        status: z.enum(["pendiente", "enviado", "entregado", "cancelado"]),
      }).parse(req.body);

      const [updated] = await db
        .update(schema.orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(schema.orders.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:id/payment",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentStatus } = z.object({
        paymentStatus: z.enum(["pendiente", "pagado", "reembolsado"]),
      }).parse(req.body);

      const updates: Record<string, unknown> = {
        paymentStatus,
        updatedAt: new Date(),
      };
      if (paymentStatus === "pagado") {
        updates.paidAt = new Date();
      }

      const [updated] = await db
        .update(schema.orders)
        .set(updates)
        .where(eq(schema.orders.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
