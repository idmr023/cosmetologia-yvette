import { schema } from "../lib/db";
type InsertData = typeof schema.colaboradores.$inferInsert;
export declare class ColaboradorRepository {
    getAll(): Promise<{
        id: string;
        phone: string | null;
        userId: string | null;
        fullName: string;
        specialty: string | null;
        commissionPct: string | null;
        isAvailable: boolean;
        colorTag: string | null;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        phone: string | null;
        userId: string | null;
        fullName: string;
        specialty: string | null;
        commissionPct: string | null;
        isAvailable: boolean;
        colorTag: string | null;
    } | null>;
    create(data: InsertData): Promise<{
        id: string;
        phone: string | null;
        userId: string | null;
        fullName: string;
        specialty: string | null;
        commissionPct: string | null;
        isAvailable: boolean;
        colorTag: string | null;
    }>;
    update(id: string, data: Partial<InsertData>): Promise<{
        id: string;
        userId: string | null;
        fullName: string;
        phone: string | null;
        specialty: string | null;
        commissionPct: string | null;
        isAvailable: boolean;
        colorTag: string | null;
    }>;
    delete(id: string): Promise<void>;
}
export {};
//# sourceMappingURL=colaboradorRepository.d.ts.map