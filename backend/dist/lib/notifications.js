"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = sendNotification;
exports.sendAppointmentConfirmation = sendAppointmentConfirmation;
exports.sendReviewRequest = sendReviewRequest;
exports.sendLowStockAlert = sendLowStockAlert;
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const email_1 = require("./email");
async function sendNotification(params) {
    try {
        await db_1.db.insert(db_1.schema.notifications).values({
            type: params.type,
            channel: "email",
            recipientId: params.recipientId,
            title: params.title,
            body: params.body,
            metadata: params.metadata ?? null,
            status: "sent",
            sentAt: new Date(),
        });
    }
    catch {
    }
}
async function sendAppointmentConfirmation(clientId, colaboradorId, clientName, serviceName, colaboradorName, date, time, modality, total) {
    const [client] = await db_1.db
        .select({ email: db_1.schema.clients.email })
        .from(db_1.schema.clients)
        .where((0, drizzle_orm_1.eq)(db_1.schema.clients.id, clientId))
        .limit(1);
    const clientEmail = client?.email;
    if (!clientEmail) {
        await sendNotification({
            type: "confirmation",
            recipientId: clientId,
            title: "Cita confirmada",
            body: `${clientName}, tu cita fue confirmada: ${serviceName} con ${colaboradorName} el ${date} a las ${time}.`,
            metadata: { clientId, colaboradorId },
        });
        return;
    }
    await (0, email_1.sendAppointmentConfirmationEmail)(clientEmail, clientName, serviceName, colaboradorName, colaboradorId, date, time, modality, total);
}
async function sendReviewRequest(clientId, appointmentId, clientName) {
    const [client] = await db_1.db
        .select({ email: db_1.schema.clients.email })
        .from(db_1.schema.clients)
        .where((0, drizzle_orm_1.eq)(db_1.schema.clients.id, clientId))
        .limit(1);
    const clientEmail = client?.email;
    if (!clientEmail) {
        const reviewUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/review/${appointmentId}`;
        await sendNotification({
            type: "review",
            recipientId: clientId,
            title: "¿Cómo fue tu experiencia?",
            body: `Califica tu cita aquí: ${reviewUrl}`,
            metadata: { appointmentId, clientName },
        });
        return;
    }
    await (0, email_1.sendReviewRequestEmail)(clientEmail, appointmentId, clientName);
}
async function sendLowStockAlert(productName, stockQty) {
    await sendNotification({
        type: "low_stock",
        recipientId: "admin",
        title: "Stock bajo",
        body: `Producto: ${productName} — Stock actual: ${stockQty} unidades. Por favor, reabastece.`,
        metadata: { productName, stockQty },
    });
}
//# sourceMappingURL=notifications.js.map