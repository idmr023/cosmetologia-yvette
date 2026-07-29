import { schema } from "../lib/db";
type InsertData = typeof schema.cashRegisters.$inferInsert;
type MovementInsert = typeof schema.cashMovements.$inferInsert;
export declare class CashRegisterRepository {
    getAll(estado?: string): Promise<{
        id: string;
        colaboradorId: string;
        apertura: Date;
        cierre: Date | null;
        montoInicial: string;
        montoEsperado: string | null;
        montoReal: string | null;
        diferencia: string | null;
        estado: string;
        notas: string | null;
        colaborador: {
            id: string;
            phone: string | null;
            userId: string | null;
            fullName: string;
            specialty: string | null;
            commissionPct: string | null;
            isAvailable: boolean;
            colorTag: string | null;
        };
        movements: {
            id: string;
            createdAt: Date;
            appointmentId: string | null;
            cajaId: string;
            tipo: string;
            monto: string;
            concepto: string | null;
        }[];
    }[]>;
    getCurrent(): Promise<{
        id: string;
        colaboradorId: string;
        apertura: Date;
        cierre: Date | null;
        montoInicial: string;
        montoEsperado: string | null;
        montoReal: string | null;
        diferencia: string | null;
        estado: string;
        notas: string | null;
        colaborador: {
            id: string;
            phone: string | null;
            userId: string | null;
            fullName: string;
            specialty: string | null;
            commissionPct: string | null;
            isAvailable: boolean;
            colorTag: string | null;
        };
        movements: {
            id: string;
            createdAt: Date;
            appointmentId: string | null;
            cajaId: string;
            tipo: string;
            monto: string;
            concepto: string | null;
        }[];
    } | null>;
    create(data: InsertData): Promise<{
        id: string;
        colaboradorId: string;
        apertura: Date;
        cierre: Date | null;
        montoInicial: string;
        montoEsperado: string | null;
        montoReal: string | null;
        diferencia: string | null;
        estado: string;
        notas: string | null;
    }>;
    close(id: string, montoReal: string, notas?: string): Promise<{
        id: string;
        colaboradorId: string;
        apertura: Date;
        cierre: Date | null;
        montoInicial: string;
        montoEsperado: string | null;
        montoReal: string | null;
        diferencia: string | null;
        estado: string;
        notas: string | null;
    }>;
    getMovements(cajaId: string): Promise<{
        id: string;
        createdAt: Date;
        appointmentId: string | null;
        cajaId: string;
        tipo: string;
        monto: string;
        concepto: string | null;
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
    }[]>;
    addMovement(cajaId: string, data: Omit<MovementInsert, "cajaId">): Promise<{
        id: string;
        createdAt: Date;
        appointmentId: string | null;
        cajaId: string;
        tipo: string;
        monto: string;
        concepto: string | null;
    }>;
}
export {};
//# sourceMappingURL=cashRegisterRepository.d.ts.map