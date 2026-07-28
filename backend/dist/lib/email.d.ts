declare const OWNER_EMAIL: string;
interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
}
declare function sendEmail({ to, subject, html }: SendEmailParams): Promise<void>;
declare function sendReviewRequestEmail(clientEmail: string, appointmentId: string, clientName: string): Promise<void>;
declare function sendAppointmentConfirmationEmail(clientEmail: string, clientName: string, serviceName: string, colaboradorName: string, colaboradorId: string, date: string, time: string, modality: string, total: string): Promise<void>;
export { sendEmail, sendReviewRequestEmail, sendAppointmentConfirmationEmail, OWNER_EMAIL };
//# sourceMappingURL=email.d.ts.map