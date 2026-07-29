export declare class CommissionRepository {
    getAll(filters?: {
        desde?: string;
        hasta?: string;
        colaboradorId?: string;
    }): Promise<{
        status: "pendiente" | "pagada";
        id: string;
        createdAt: Date;
        colaboradorId: string;
        appointmentId: string;
        amount: string;
        settledAt: Date | null;
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
            client: {
                id: string;
                email: string | null;
                phone: string;
                createdAt: Date;
                userId: string | null;
                firstName: string;
                lastName: string;
                dni: string;
                notes: string | null;
            };
        };
    }[]>;
    pay(id: string): Promise<{
        id: string;
        appointmentId: string;
        colaboradorId: string;
        amount: string;
        status: "pendiente" | "pagada";
        settledAt: Date | null;
        createdAt: Date;
    }>;
}
//# sourceMappingURL=commissionRepository.d.ts.map