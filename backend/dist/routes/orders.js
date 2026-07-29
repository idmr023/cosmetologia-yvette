"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
const clientInfoSchema = zod_1.z.object({
    clientDni: zod_1.z.string().regex(/^\d{8}$/, "DNI debe tener 8 dígitos"),
    firstName: zod_1.z.string().min(1, "Nombre requerido"),
    lastName: zod_1.z.string().min(1, "Apellido requerido"),
    phone: zod_1.z.string().min(6, "Teléfono requerido"),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal("")),
});
const createOrderSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        inventoryId: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().int().positive(),
    })).min(1),
    deliveryMethod: zod_1.z.enum(["recojo", "delivery"]).optional().default("recojo"),
    shippingAddress: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.enum(["yape", "plin", "efectivo", "transferencia", "mercadopago"]).optional(),
}).and(zod_1.z.union([
    zod_1.z.object({ clientId: zod_1.z.string().uuid() }),
    clientInfoSchema,
]));
router.post("/", async (req, res, next) => {
    try {
        const body = createOrderSchema.parse(req.body);
        let clientId = body.clientId;
        if (!clientId) {
            const info = body;
            let client = await db_1.db
                .select()
                .from(db_1.schema.clients)
                .where((0, drizzle_orm_1.eq)(db_1.schema.clients.dni, info.clientDni))
                .limit(1)
                .then((rows) => rows[0]);
            if (!client) {
                [client] = await db_1.db
                    .insert(db_1.schema.clients)
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
        const products = await db_1.db
            .select()
            .from(db_1.schema.inventory)
            .where((0, drizzle_orm_1.inArray)(db_1.schema.inventory.id, productIds));
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
        const [order] = await db_1.db
            .insert(db_1.schema.orders)
            .values({
            clientId,
            totalAmount: totalAmount.toFixed(2),
            deliveryMethod: body.deliveryMethod,
            shippingAddress: body.shippingAddress,
            notes: body.notes,
            paymentMethod: body.paymentMethod ?? null,
        })
            .returning();
        await db_1.db.insert(db_1.schema.orderItems).values(body.items.map((item) => {
            const product = products.find((p) => p.id === item.inventoryId);
            return {
                orderId: order.id,
                inventoryId: item.inventoryId,
                quantity: item.quantity,
                unitPrice: product?.unitPrice ?? "0",
            };
        }));
        for (const item of body.items) {
            await db_1.db
                .update(db_1.schema.inventory)
                .set({ stockQty: (0, drizzle_orm_1.sql) `stock_qty - ${item.quantity}` })
                .where((0, drizzle_orm_1.eq)(db_1.schema.inventory.id, item.inventoryId));
        }
        res.status(201).json(order);
    }
    catch (error) {
        next(error);
    }
});
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador"), async (req, res, next) => {
    try {
        const { clientId } = req.query;
        const filters = clientId && typeof clientId === "string"
            ? (0, drizzle_orm_1.eq)(db_1.schema.orders.clientId, clientId)
            : undefined;
        const orders = await db_1.db
            .select()
            .from(db_1.schema.orders)
            .where(filters)
            .orderBy((0, drizzle_orm_1.desc)(db_1.schema.orders.createdAt))
            .limit(50);
        const enriched = await Promise.all(orders.map(async (order) => {
            const items = await db_1.db
                .select()
                .from(db_1.schema.orderItems)
                .where((0, drizzle_orm_1.eq)(db_1.schema.orderItems.orderId, order.id));
            const client = await db_1.db
                .select({ firstName: db_1.schema.clients.firstName, lastName: db_1.schema.clients.lastName })
                .from(db_1.schema.clients)
                .where((0, drizzle_orm_1.eq)(db_1.schema.clients.id, order.clientId))
                .limit(1)
                .then((r) => r[0]);
            return { ...order, items, clientName: client ? `${client.firstName} ${client.lastName}` : "—" };
        }));
        res.json({ data: enriched });
    }
    catch (error) {
        next(error);
    }
});
router.get("/mine", auth_1.authenticate, (0, auth_1.authorize)("cliente"), async (req, res, next) => {
    try {
        const clientId = req.user?.clientId;
        if (!clientId) {
            res.status(400).json({ error: "No se encontró cliente vinculado." });
            return;
        }
        const orders = await db_1.db
            .select()
            .from(db_1.schema.orders)
            .where((0, drizzle_orm_1.eq)(db_1.schema.orders.clientId, clientId))
            .orderBy((0, drizzle_orm_1.desc)(db_1.schema.orders.createdAt))
            .limit(50);
        const enriched = await Promise.all(orders.map(async (order) => {
            const items = await db_1.db
                .select()
                .from(db_1.schema.orderItems)
                .where((0, drizzle_orm_1.eq)(db_1.schema.orderItems.orderId, order.id));
            const products = items.length > 0
                ? await db_1.db
                    .select({ id: db_1.schema.inventory.id, name: db_1.schema.inventory.name })
                    .from(db_1.schema.inventory)
                    .where((0, drizzle_orm_1.inArray)(db_1.schema.inventory.id, items.map((i) => i.inventoryId)))
                : [];
            const enrichedItems = items.map((item) => ({
                ...item,
                name: products.find((p) => p.id === item.inventoryId)?.name ?? "Producto",
            }));
            return { ...order, items: enrichedItems };
        }));
        res.json({ data: enriched });
    }
    catch (error) {
        next(error);
    }
});
router.get("/:id", async (req, res, next) => {
    try {
        const [order] = await db_1.db
            .select()
            .from(db_1.schema.orders)
            .where((0, drizzle_orm_1.eq)(db_1.schema.orders.id, req.params.id))
            .limit(1);
        if (!order) {
            res.status(404).json({ error: "Pedido no encontrado." });
            return;
        }
        const items = await db_1.db
            .select()
            .from(db_1.schema.orderItems)
            .where((0, drizzle_orm_1.eq)(db_1.schema.orderItems.orderId, order.id));
        const products = items.length > 0
            ? await db_1.db
                .select({ id: db_1.schema.inventory.id, name: db_1.schema.inventory.name })
                .from(db_1.schema.inventory)
                .where((0, drizzle_orm_1.inArray)(db_1.schema.inventory.id, items.map((i) => i.inventoryId)))
            : [];
        const enrichedItems = items.map((item) => ({
            ...item,
            name: products.find((p) => p.id === item.inventoryId)?.name ?? "Producto",
        }));
        const client = await db_1.db
            .select({ firstName: db_1.schema.clients.firstName, lastName: db_1.schema.clients.lastName, phone: db_1.schema.clients.phone })
            .from(db_1.schema.clients)
            .where((0, drizzle_orm_1.eq)(db_1.schema.clients.id, order.clientId))
            .limit(1)
            .then((r) => r[0]);
        res.json({ ...order, items: enrichedItems, clientName: client ? `${client.firstName} ${client.lastName}` : "—", clientPhone: client?.phone });
    }
    catch (error) {
        next(error);
    }
});
router.patch("/:id/status", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const { status } = zod_1.z.object({
            status: zod_1.z.enum(["pendiente", "enviado", "entregado", "cancelado"]),
        }).parse(req.body);
        const [updated] = await db_1.db
            .update(db_1.schema.orders)
            .set({ status, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(db_1.schema.orders.id, req.params.id))
            .returning();
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
router.patch("/:id/payment", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const { paymentStatus } = zod_1.z.object({
            paymentStatus: zod_1.z.enum(["pendiente", "pagado", "reembolsado"]),
        }).parse(req.body);
        const updates = {
            paymentStatus,
            updatedAt: new Date(),
        };
        if (paymentStatus === "pagado") {
            updates.paidAt = new Date();
        }
        const [updated] = await db_1.db
            .update(db_1.schema.orders)
            .set(updates)
            .where((0, drizzle_orm_1.eq)(db_1.schema.orders.id, req.params.id))
            .returning();
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map