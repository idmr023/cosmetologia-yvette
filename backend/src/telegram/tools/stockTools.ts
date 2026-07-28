import { db, schema } from "../../lib/db";
import { ilike, asc } from "drizzle-orm";

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

export async function consultarStock(producto?: string): Promise<StockItem[]> {
  const items = await db.query.inventory.findMany({
    where: producto ? ilike(schema.inventory.name, `%${producto}%`) : undefined,
    orderBy: [asc(schema.inventory.name)],
    limit: 50,
  });
  return items.map((i) => ({
    id: i.id,
    name: i.name,
    type: i.type,
    category: i.category,
    stockQty: i.stockQty,
    minStock: i.minStock,
    unitPrice: i.unitPrice,
    supplier: i.supplier,
  }));
}
