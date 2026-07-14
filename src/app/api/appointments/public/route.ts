import { NextRequest, NextResponse } from "next/server";
import { eq, and, lt, gt, inArray } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { getSetting } from "@/lib/settings";

type AppointmentStatus = "pendiente" | "confirmada" | "completada" | "cancelada";

const bookingSchema = z.object({
  serviceId: z.string().uuid(),
  colaboradorId: z.string().uuid(),
  startAt: z.string(),
  modality: z.enum(["salon", "domicilio"]),
  clientName: z.string().min(2),
  clientPhone: z.string().min(6),
  clientEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Lookup service
  const [service] = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.id, data.serviceId));
  if (!service) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
  }

  // Lookup colaborador
  const [colaborador] = await db
    .select()
    .from(schema.colaboradores)
    .where(eq(schema.colaboradores.id, data.colaboradorId));
  if (!colaborador) {
    return NextResponse.json({ error: "Colaboradora no encontrada" }, { status: 404 });
  }

  // Calcular costo
  const basePrice = Number(service.price);
  let totalPrice = basePrice;
  let domicilioRecargo = 0;

  if (data.modality === "domicilio") {
    domicilioRecargo = Number((await getSetting("domicilio_recargo")) ?? "0");
    totalPrice += domicilioRecargo;
  }

  const startAt = new Date(data.startAt);
  const endAt = new Date(startAt.getTime() + service.durationMin * 60000);

  // Validar disponibilidad: no overlapping con citas activas de la misma colaboradora
  const activeStatuses: AppointmentStatus[] = ["pendiente", "confirmada"];
  const overlapping = await db
    .select({ id: schema.appointments.id })
    .from(schema.appointments)
    .where(
      and(
        eq(schema.appointments.colaboradorId, colaborador.id),
        inArray(schema.appointments.status, activeStatuses),
        lt(schema.appointments.startAt, endAt),
        gt(schema.appointments.endAt, startAt),
      ),
    );

  if (overlapping.length > 0) {
    return NextResponse.json(
      {
        error:
          "La colaboradora ya tiene una cita en ese horario. Elige otra fecha u hora.",
      },
      { status: 409 },
    );
  }

  // Validar horario de atención (Lunes-Sábado, 9:00-19:00)
  const day = startAt.getDay();
  const hour = startAt.getHours();
  if (day === 0 || hour < 9 || hour >= 19) {
    return NextResponse.json(
      { error: "Horario no válido. Atención: Lunes a Sábado, 9:00 AM a 7:00 PM." },
      { status: 400 },
    );
  }

  // Crear cliente si no existe (por teléfono)
  let [client] = await db
    .select()
    .from(schema.clients)
    .where(eq(schema.clients.phone, data.clientPhone));

  if (!client) {
    const [nameParts] = data.clientName.split(" ");
    const firstName = nameParts ?? data.clientName;
    const lastName = data.clientName.split(" ").slice(1).join(" ") || "Cliente";
    [client] = await db
      .insert(schema.clients)
      .values({
        firstName,
        lastName,
        phone: data.clientPhone,
        email: data.clientEmail || null,
      })
      .returning();
  }

  // Crear cita
  const [appointment] = await db
    .insert(schema.appointments)
    .values({
      clientId: client.id,
      colaboradorId: colaborador.id,
      startAt,
      endAt,
      status: "pendiente",
      totalPrice: totalPrice.toFixed(2),
      notes: data.notes ?? null,
    })
    .returning();

  // Relación cita-servicio
  await db.insert(schema.appointmentServices).values({
    appointmentId: appointment.id,
    serviceId: service.id,
    quantity: 1,
  });

  // Devolver datos completos para la boleta
  return NextResponse.json({
    appointmentId: appointment.id,
    boletaNumber: appointment.id.slice(0, 8).toUpperCase(),
    clientName: `${client.firstName} ${client.lastName}`,
    clientPhone: client.phone,
    serviceName: service.name,
    serviceCategory: service.category,
    colaboradorName: colaborador.fullName,
    startAt: startAt.toISOString(),
    modality: data.modality,
    basePrice: basePrice.toFixed(2),
    domicilioRecargo: domicilioRecargo.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  }, { status: 201 });
}

// GET: si ?id= devuelve detalle de cita; si no, lista servicios + colaboradores
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const apt = await db.query.appointments.findFirst({
      where: eq(schema.appointments.id, id),
      with: {
        client: true,
        colaborador: true,
        services: { with: { service: true } },
      },
    });

    if (!apt) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      id: apt.id,
      clientName: apt.client ? `${apt.client.firstName} ${apt.client.lastName}` : "Cliente",
      clientPhone: apt.client?.phone ?? "",
      services: apt.services
        .map((s) => s.service?.name)
        .filter((n): n is string => Boolean(n)),
      colaboradorName: apt.colaborador?.fullName ?? "Sin asignar",
      startAt: apt.startAt,
      status: apt.status,
      totalPrice: apt.totalPrice,
      notes: apt.notes,
    });
  }

  const services = await db
    .select({
      id: schema.services.id,
      name: schema.services.name,
      category: schema.services.category,
      durationMin: schema.services.durationMin,
      price: schema.services.price,
    })
    .from(schema.services)
    .where(eq(schema.services.isActive, true));

  const colaboradores = await db
    .select({
      id: schema.colaboradores.id,
      fullName: schema.colaboradores.fullName,
      specialty: schema.colaboradores.specialty,
      isAvailable: schema.colaboradores.isAvailable,
    })
    .from(schema.colaboradores)
    .where(eq(schema.colaboradores.isAvailable, true));

  const domicilioRecargo = (await getSetting("domicilio_recargo")) ?? "0";

  return NextResponse.json({ services, colaboradores, domicilioRecargo });
}