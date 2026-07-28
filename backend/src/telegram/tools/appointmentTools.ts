import { db, schema } from "../../lib/db";
import { eq, gte, lt, ilike, asc, and } from "drizzle-orm";

export interface AppointmentInfo {
  id: string;
  clientName: string;
  clientPhone: string;
  services: string[];
  colaboradorName: string;
  startAt: string;
  status: string;
  totalPrice: string;
}

export async function consultarCitas(
  fecha?: string,
  colaboradora?: string,
): Promise<AppointmentInfo[]> {
  const filters: ReturnType<typeof eq | typeof gte | typeof lt | typeof ilike>[] = [];

  if (fecha) {
    const start = new Date(fecha + "T00:00:00.000Z");
    const end = new Date(fecha + "T23:59:59.999Z");
    filters.push(gte(schema.appointments.startAt, start));
    filters.push(lt(schema.appointments.startAt, end));
  }

  if (colaboradora) {
    const colMatch = await db.query.colaboradores.findFirst({
      where: ilike(schema.colaboradores.fullName, `%${colaboradora}%`),
    });
    if (colMatch) {
      filters.push(eq(schema.appointments.colaboradorId, colMatch.id));
    }
  }

  const rows = await db.query.appointments.findMany({
    where: filters.length > 0 ? and(...filters) : undefined,
    with: {
      client: true,
      colaborador: true,
      services: { with: { service: true } },
    },
    orderBy: [asc(schema.appointments.startAt)],
    limit: 30,
  });

  return rows.map((r: any) => ({
    id: r.id as string,
    clientName: `${r.client.firstName} ${r.client.lastName}`,
    clientPhone: r.client.phone,
    services: r.services.map((s: any) => s.service.name),
    colaboradorName: r.colaborador.fullName,
    startAt: r.startAt.toISOString(),
    status: r.status as string,
    totalPrice: r.totalPrice as string,
  }));
}
