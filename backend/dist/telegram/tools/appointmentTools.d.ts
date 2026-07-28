export interface AppointmentInfo {
    id: string;
    clientName: string;
    clientPhone: string;
    services: string[];
    colaboradorName: string;
    startAt: string;
    status: string;
    totalPrice: string;
}
export declare function consultarCitas(fecha?: string, colaboradora?: string): Promise<AppointmentInfo[]>;
//# sourceMappingURL=appointmentTools.d.ts.map