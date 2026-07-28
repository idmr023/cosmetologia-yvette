import { db, schema } from "../../lib/db";
import { eq, asc } from "drizzle-orm";

export interface ServiceInfo {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  price: string;
  description: string | null;
}

export async function consultarServicios(): Promise<ServiceInfo[]> {
  const services = await db.query.services.findMany({
    where: eq(schema.services.isActive, true),
    orderBy: [asc(schema.services.name)],
  });
  return services.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    durationMin: s.durationMin,
    price: s.price,
    description: s.description,
  }));
}
