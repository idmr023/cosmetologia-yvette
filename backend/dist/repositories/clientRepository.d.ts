import { schema } from "../lib/db";
type InsertData = typeof schema.clients.$inferInsert;
export declare class ClientRepository {
    getAll(): Promise<{
        id: string;
        email: string | null;
        phone: string;
        createdAt: Date;
        userId: string | null;
        firstName: string;
        lastName: string;
        dni: string;
        notes: string | null;
    }[]>;
    create(data: InsertData): Promise<{
        id: string;
        email: string | null;
        phone: string;
        createdAt: Date;
        userId: string | null;
        firstName: string;
        lastName: string;
        dni: string;
        notes: string | null;
    }>;
    update(id: string, data: Partial<InsertData>): Promise<{
        id: string;
        userId: string | null;
        firstName: string;
        lastName: string;
        dni: string;
        phone: string;
        email: string | null;
        notes: string | null;
        createdAt: Date;
    }>;
    delete(id: string): Promise<void>;
    getHistory(clientId: string): Promise<{
        id: string;
        clientId: string;
        appointmentId: string | null;
        serviceId: string | null;
        details: unknown;
        performedAt: Date;
        appointment: {
            status: "pendiente" | "confirmada" | "completada" | "cancelada";
            id: string;
            createdAt: Date;
            notes: string | null;
            clientId: string;
            colaboradorId: string;
            startAt: Date;
            endAt: Date;
            totalPrice: string;
        } | null;
        service: {
            id: string;
            name: string;
            category: string;
            durationMin: number;
            price: string;
            description: string | null;
            isActive: boolean;
        } | null;
    }[]>;
}
export {};
//# sourceMappingURL=clientRepository.d.ts.map