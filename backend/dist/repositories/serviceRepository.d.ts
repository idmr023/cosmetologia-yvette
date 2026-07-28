import { schema } from "../lib/db";
type InsertData = typeof schema.services.$inferInsert;
export declare class ServiceRepository {
    getAll(): Promise<{
        id: string;
        name: string;
        category: string;
        durationMin: number;
        price: string;
        description: string | null;
        isActive: boolean;
    }[]>;
    create(data: InsertData): Promise<{
        id: string;
        name: string;
        category: string;
        durationMin: number;
        price: string;
        description: string | null;
        isActive: boolean;
    }>;
    update(id: string, data: Partial<InsertData>): Promise<{
        id: string;
        name: string;
        category: string;
        durationMin: number;
        price: string;
        description: string | null;
        isActive: boolean;
    }>;
    delete(id: string): Promise<void>;
}
export {};
//# sourceMappingURL=serviceRepository.d.ts.map