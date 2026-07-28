import { db, schema } from "./db";
import { eq } from "drizzle-orm";
import { sendReviewRequestEmail, sendAppointmentConfirmationEmail } from "./email";

interface SendParams {
  type: "reminder" | "confirmation" | "promotion" | "low_stock" | "review";
  recipientId: string;
  title?: string;
  body: string;
  metadata?: Record<string, unknown>;
}

async function sendNotification(params: SendParams): Promise<void> {
  try {
    await db.insert(schema.notifications).values({
      type: params.type,
      channel: "email",
      recipientId: params.recipientId,
      title: params.title,
      body: params.body,
      metadata: params.metadata ?? null,
      status: "sent",
      sentAt: new Date(),
    });
  } catch {
  }
}

async function sendAppointmentConfirmation(
  clientId: string,
  colaboradorId: string,
  clientName: string,
  serviceName: string,
  colaboradorName: string,
  date: string,
  time: string,
  modality: string,
  total: string,
): Promise<void> {
  const [client] = await db
    .select({ email: schema.clients.email })
    .from(schema.clients)
    .where(eq(schema.clients.id, clientId))
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

  await sendAppointmentConfirmationEmail(
    clientEmail,
    clientName,
    serviceName,
    colaboradorName,
    colaboradorId,
    date,
    time,
    modality,
    total,
  );
}

async function sendReviewRequest(
  clientId: string,
  appointmentId: string,
  clientName: string,
): Promise<void> {
  const [client] = await db
    .select({ email: schema.clients.email })
    .from(schema.clients)
    .where(eq(schema.clients.id, clientId))
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

  await sendReviewRequestEmail(clientEmail, appointmentId, clientName);
}

async function sendLowStockAlert(productName: string, stockQty: number): Promise<void> {
  await sendNotification({
    type: "low_stock",
    recipientId: "admin",
    title: "Stock bajo",
    body: `Producto: ${productName} — Stock actual: ${stockQty} unidades. Por favor, reabastece.`,
    metadata: { productName, stockQty },
  });
}

export { sendNotification, sendAppointmentConfirmation, sendReviewRequest, sendLowStockAlert };
