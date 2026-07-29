interface SendParams {
    type: "reminder" | "confirmation" | "promotion" | "low_stock" | "review";
    recipientId: string;
    title?: string;
    body: string;
    metadata?: Record<string, unknown>;
}
declare function sendNotification(params: SendParams): Promise<void>;
declare function sendAppointmentConfirmation(clientId: string, colaboradorId: string, clientName: string, serviceName: string, colaboradorName: string, date: string, time: string, modality: string, total: string): Promise<void>;
declare function sendReviewRequest(clientId: string, appointmentId: string, clientName: string): Promise<void>;
declare function sendLowStockAlert(productName: string, stockQty: number): Promise<void>;
export { sendNotification, sendAppointmentConfirmation, sendReviewRequest, sendLowStockAlert };
//# sourceMappingURL=notifications.d.ts.map