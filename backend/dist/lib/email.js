"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OWNER_EMAIL = void 0;
exports.sendEmail = sendEmail;
exports.sendReviewRequestEmail = sendReviewRequestEmail;
exports.sendAppointmentConfirmationEmail = sendAppointmentConfirmationEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("./db");
const OWNER_EMAIL = process.env.NOTIFICATION_OWNER_EMAIL || "admin@yvette.com";
exports.OWNER_EMAIL = OWNER_EMAIL;
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
    },
});
const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@yvette.com";
async function sendEmail({ to, subject, html }) {
    const recipients = Array.isArray(to) ? to : [to];
    const recipientList = recipients.filter(Boolean);
    if (recipientList.length === 0)
        return;
    try {
        await transporter.sendMail({
            from: `"Centro de Estética Yvette" <${from}>`,
            to: recipientList.join(", "),
            subject,
            html,
        });
    }
    catch (error) {
        console.error("[Email] Failed to send:", error);
    }
    for (const recipient of recipientList) {
        try {
            await db_1.db.insert(db_1.schema.notifications).values({
                type: "confirmation",
                channel: "email",
                recipientId: recipient,
                title: subject,
                body: html.replace(/<[^>]*>/g, "").substring(0, 500),
                status: "sent",
                sentAt: new Date(),
            });
        }
        catch {
        }
    }
}
async function sendReviewRequestEmail(clientEmail, appointmentId, clientName) {
    const reviewUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/review/${appointmentId}`;
    await sendEmail({
        to: clientEmail,
        subject: "¿Cómo fue tu experiencia en Yvette?",
        html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#C9A227;margin-bottom:16px">Centro de Estética Yvette</h2>
        <p style="color:#333;font-size:16px">Hola ${clientName},</p>
        <p style="color:#555;font-size:15px">Queremos saber cómo fue tu experiencia. ¿Nos ayudas con una reseña?</p>
        <a href="${reviewUrl}" style="display:inline-block;background:#C9A227;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:16px;margin:16px 0">Calificar mi atención</a>
        <p style="color:#999;font-size:12px;margin-top:24px">Centro de Estética Yvette — Cercado de Lima</p>
      </div>
    `,
    });
}
async function sendAppointmentConfirmationEmail(clientEmail, clientName, serviceName, colaboradorName, colaboradorId, date, time, modality, total) {
    const [colaboradorUser] = await db_1.db
        .select({ userEmail: db_1.schema.users.email })
        .from(db_1.schema.colaboradores)
        .innerJoin(db_1.schema.users, (0, drizzle_orm_1.eq)(db_1.schema.users.id, db_1.schema.colaboradores.userId))
        .where((0, drizzle_orm_1.eq)(db_1.schema.colaboradores.id, colaboradorId))
        .limit(1);
    const clientHtml = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#C9A227;margin-bottom:16px">Centro de Estética Yvette</h2>
      <p style="color:#333;font-size:16px">¡Hola ${clientName}!</p>
      <p style="color:#555;font-size:15px">Tu cita fue confirmada:</p>
      <table style="width:100%;margin:16px 0;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#888">Servicio</td><td style="padding:8px 0;font-weight:600">${serviceName}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Especialista</td><td style="padding:8px 0;font-weight:600">${colaboradorName}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Fecha</td><td style="padding:8px 0;font-weight:600">${date}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Hora</td><td style="padding:8px 0;font-weight:600">${time}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Modalidad</td><td style="padding:8px 0;font-weight:600">${modality}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Total</td><td style="padding:8px 0;font-weight:600">S/ ${total}</td></tr>
      </table>
      <p style="color:#999;font-size:12px">Cercado de Lima — Pago en efectivo, Yape o Plin</p>
      <p style="color:#999;font-size:12px">¡Te esperamos!</p>
    </div>
  `;
    const ownerHtml = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#C9A227;margin-bottom:16px">Centro de Estética Yvette</h2>
      <p style="color:#333;font-size:16px">Nueva cita registrada</p>
      <table style="width:100%;margin:16px 0;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#888">Cliente</td><td style="padding:8px 0;font-weight:600">${clientName}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Servicio</td><td style="padding:8px 0;font-weight:600">${serviceName}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Colaboradora</td><td style="padding:8px 0;font-weight:600">${colaboradorName}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Fecha</td><td style="padding:8px 0;font-weight:600">${date}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Hora</td><td style="padding:8px 0;font-weight:600">${time}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Modalidad</td><td style="padding:8px 0;font-weight:600">${modality}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Total</td><td style="padding:8px 0;font-weight:600">S/ ${total}</td></tr>
      </table>
    </div>
  `;
    const colaboradorHtml = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#C9A227;margin-bottom:16px">Centro de Estética Yvette</h2>
      <p style="color:#333;font-size:16px">Hola ${colaboradorName},</p>
      <p style="color:#555;font-size:15px">Tienes una nueva cita asignada:</p>
      <table style="width:100%;margin:16px 0;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#888">Cliente</td><td style="padding:8px 0;font-weight:600">${clientName}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Servicio</td><td style="padding:8px 0;font-weight:600">${serviceName}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Fecha</td><td style="padding:8px 0;font-weight:600">${date}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Hora</td><td style="padding:8px 0;font-weight:600">${time}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Modalidad</td><td style="padding:8px 0;font-weight:600">${modality}</td></tr>
      </table>
    </div>
  `;
    await sendEmail({ to: clientEmail, subject: "Tu cita fue confirmada - Centro de Estética Yvette", html: clientHtml });
    await sendEmail({ to: OWNER_EMAIL, subject: `Nueva cita: ${clientName} con ${colaboradorName}`, html: ownerHtml });
    if (colaboradorUser?.userEmail) {
        await sendEmail({ to: colaboradorUser.userEmail, subject: "Tienes una nueva cita - Yvette", html: colaboradorHtml });
    }
}
//# sourceMappingURL=email.js.map