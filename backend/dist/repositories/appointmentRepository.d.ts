import { schema } from "../lib/db";
type InsertData = typeof schema.appointments.$inferInsert;
export declare class AppointmentRepository {
    getAll(): Promise<{
        id: string;
        clientName: string;
        clientPhone: any;
        services: any;
        colaboradorName: any;
        startAt: Date;
        status: string;
        totalPrice: string;
    }[]>;
    getById(id: string): Promise<{
        id: any;
        clientName: string;
        clientPhone: any;
        services: any;
        colaboradorName: any;
        startAt: any;
        status: any;
        totalPrice: any;
    } | null>;
    create(data: InsertData): Promise<{
        status: "pendiente" | "confirmada" | "completada" | "cancelada";
        id: string;
        createdAt: Date;
        notes: string | null;
        clientId: string;
        colaboradorId: string;
        startAt: Date;
        endAt: Date;
        totalPrice: string;
    }>;
    update(id: string, data: Partial<InsertData>): Promise<{
        id: string;
        clientId: string;
        colaboradorId: string;
        startAt: Date;
        endAt: Date;
        status: "pendiente" | "confirmada" | "completada" | "cancelada";
        totalPrice: string;
        notes: string | null;
        createdAt: Date;
    }>;
    delete(id: string): Promise<void>;
}
export {};
//# sourceMappingURL=appointmentRepository.d.ts.map