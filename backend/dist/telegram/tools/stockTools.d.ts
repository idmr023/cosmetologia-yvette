export interface StockItem {
    id: string;
    name: string;
    type: string;
    category: string | null;
    stockQty: number;
    minStock: number;
    unitPrice: string | null;
    supplier: string | null;
}
export declare function consultarStock(producto?: string): Promise<StockItem[]>;
//# sourceMappingURL=stockTools.d.ts.map