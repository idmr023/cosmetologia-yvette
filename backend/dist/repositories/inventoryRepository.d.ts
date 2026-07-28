import { schema } from "../lib/db";
type InsertData = typeof schema.inventory.$inferInsert;
export declare class InventoryRepository {
    getAll(): Promise<{
        id: string;
        name: string;
        category: string | null;
        type: "uso" | "venta";
        stockQty: number;
        minStock: number;
        unitPrice: string | null;
        supplier: string | null;
        updatedAt: Date;
    }[]>;
    create(data: InsertData): Promise<{
        id: string;
        name: string;
        category: string | null;
        type: "uso" | "venta";
        stockQty: number;
        minStock: number;
        unitPrice: string | null;
        supplier: string | null;
        updatedAt: Date;
    }>;
    update(id: string, data: Partial<InsertData>): Promise<{
        id: string;
        name: string;
        type: "uso" | "venta";
        category: string | null;
        stockQty: number;
        minStock: number;
        unitPrice: string | null;
        supplier: string | null;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<void>;
}
export {};
//# sourceMappingURL=inventoryRepository.d.ts.map