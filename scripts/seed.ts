import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db, schema } = await import("../src/lib/db");
  const { SEED_SERVICES, SEED_COLABORADORAS } = await import("../src/lib/seed/services");
  const bcrypt = (await import("bcryptjs")).default;
  const { eq } = await import("drizzle-orm");

  console.log("=== Seeding database ===\n");

  const hash = await bcrypt.hash("yvette2025", 10);

  // --- 1. Users ---
  console.log("Creating users...");

  const [admin] = await db
    .insert(schema.users)
    .values({
      email: "admin@yvette.com",
      passwordHash: hash,
      name: "Yvette Roa",
      phone: "991697726",
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  const colabs = SEED_COLABORADORAS.filter((c) => c.fullName !== "Yvette Roa de Burga");

  const colaboradorUsers: Record<string, typeof schema.users.$inferSelect> = {};
  for (const col of colabs) {
    const email = `${col.fullName.split(" ")[0].toLowerCase()}@yvette.com`;
    const [user] = await db
      .insert(schema.users)
      .values({
        email,
        passwordHash: hash,
        name: col.fullName,
        phone: col.phone,
        role: "colaborador",
      })
      .onConflictDoNothing()
      .returning();
    if (user) {
      const key = col.fullName.split(" ")[0].toLowerCase();
      colaboradorUsers[key] = user;
    }
  }

  const [clientUser] = await db
    .insert(schema.users)
    .values({
      email: "maria@test.com",
      passwordHash: hash,
      name: "María Gonzalez",
      phone: "999888777",
      role: "cliente",
    })
    .onConflictDoNothing()
    .returning();

  console.log(`  Admin: ${admin?.email ?? "(already exists)"}`);
  console.log(`  Elizabeth: ${colaboradorUsers.elizabeth?.email ?? "(already exists)"}`);
  console.log(`  Lourdes: ${colaboradorUsers.lourdes?.email ?? "(already exists)"}`);
  console.log(`  Cliente: ${clientUser?.email ?? "(already exists)"}\n`);

  const [ivanUserRow] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "ivan@test.com"))
    .limit(1);
  console.log(`  Ivan: ${ivanUserRow?.email ?? "(already exists)"}\n`);

  // --- 2. Colaboradores ---
  console.log("Creating colaboradores...");

  await db
    .insert(schema.colaboradores)
    .values({
      userId: admin?.id,
      fullName: "Yvette Roa de Burga",
      phone: "991697726",
      specialty: "Dirección y Estética Facial",
      commissionPct: "0",
      isAvailable: true,
      colorTag: "#C9A227",
    })
    .onConflictDoNothing();

  if (colaboradorUsers.elizabeth) {
    await db
      .insert(schema.colaboradores)
      .values({
        userId: colaboradorUsers.elizabeth.id,
        fullName: "Elizabeth Roa Prado",
        phone: "989187417",
        specialty: "Peluquería y Color",
        commissionPct: "40",
        isAvailable: true,
        colorTag: "#B8D4E3",
      })
      .onConflictDoNothing();
  }

  if (colaboradorUsers.lourdes) {
    await db
      .insert(schema.colaboradores)
      .values({
        userId: colaboradorUsers.lourdes.id,
        fullName: "Lourdes Roa Prado",
        phone: "989284171",
        specialty: "Laceados y Tratamientos",
        commissionPct: "40",
        isAvailable: true,
        colorTag: "#E8A0BF",
      })
      .onConflictDoNothing();
  }

  console.log("  3 colaboradores created\n");

  // --- 3. Services ---
  console.log("Creating services...");

  for (const svc of SEED_SERVICES) {
    await db
      .insert(schema.services)
      .values({
        name: svc.name,
        category: svc.category,
        durationMin: svc.durationMin,
        price: svc.price.toString(),
        description: null,
        isActive: true,
      })
      .onConflictDoNothing();
  }

  console.log(`  ${SEED_SERVICES.length} services created\n`);

  // --- 4. Client (linked to user) ---
  console.log("Creating client...");

  const [client] = await db
    .insert(schema.clients)
    .values({
      userId: clientUser?.id,
      firstName: "María",
      lastName: "Gonzalez",
      dni: "12345678",
      phone: "999888777",
      email: "maria@test.com",
    })
    .onConflictDoNothing()
    .returning();

  console.log(`  Client: ${client?.firstName ?? "(already exists)"} ${client?.lastName ?? ""} (DNI: 12345678)\n`);

  // --- 5. Appointments ---
  console.log("Creating appointments...");

  const [lourdesCol] = await db
    .select({ id: schema.colaboradores.id })
    .from(schema.colaboradores)
    .where(eq(schema.colaboradores.fullName, "Lourdes Roa Prado"))
    .limit(1);

  const [elizabethCol] = await db
    .select({ id: schema.colaboradores.id })
    .from(schema.colaboradores)
    .where(eq(schema.colaboradores.fullName, "Elizabeth Roa Prado"))
    .limit(1);

  const [corteService] = await db
    .select({ id: schema.services.id, price: schema.services.price })
    .from(schema.services)
    .where(eq(schema.services.name, "Corte de cabello"))
    .limit(1);

  const [tinteService] = await db
    .select({ id: schema.services.id, price: schema.services.price })
    .from(schema.services)
    .where(eq(schema.services.name, "Tinte"))
    .limit(1);

  const clientId = client?.id;
  const lourdesId = lourdesCol?.id;
  const elizabethId = elizabethCol?.id;

  if (clientId && lourdesId && corteService) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    pastDate.setHours(10, 0, 0, 0);
    const pastEnd = new Date(pastDate);
    pastEnd.setHours(11, 0, 0, 0);

    const [apt] = await db
      .insert(schema.appointments)
      .values({
        clientId,
        colaboradorId: lourdesId,
        startAt: pastDate,
        endAt: pastEnd,
        status: "completada",
        totalPrice: corteService.price,
      })
      .onConflictDoNothing()
      .returning();

    if (apt) {
      await db
        .insert(schema.appointmentServices)
        .values({
          appointmentId: apt.id,
          serviceId: corteService.id,
          quantity: 1,
        })
        .onConflictDoNothing();
    }

    console.log("  Past completed appointment (for review testing)");
  }

  if (clientId && elizabethId && tinteService) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    futureDate.setHours(15, 0, 0, 0);
    const futureEnd = new Date(futureDate);
    futureEnd.setHours(16, 30, 0, 0);

    const [apt] = await db
      .insert(schema.appointments)
      .values({
        clientId,
        colaboradorId: elizabethId,
        startAt: futureDate,
        endAt: futureEnd,
        status: "pendiente",
        totalPrice: tinteService.price,
      })
      .onConflictDoNothing()
      .returning();

    if (apt) {
      await db
        .insert(schema.appointmentServices)
        .values({
          appointmentId: apt.id,
          serviceId: tinteService.id,
          quantity: 1,
        })
        .onConflictDoNothing();
    }

    console.log("  Future pending appointment");
  }

  // --- 6. Ivan Daniel Manrique Roa (client with review) ---
  console.log("\nCreating Ivan Daniel Manrique Roa...");

  let [ivanUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "ivan@test.com"))
    .limit(1);

  if (!ivanUser) {
    [ivanUser] = await db
      .insert(schema.users)
      .values({
        email: "ivan@test.com",
        passwordHash: hash,
        name: "Ivan Daniel Manrique Roa",
        phone: "988111222",
        role: "cliente",
      })
      .returning();
  }

  let [ivanClient] = await db
    .select()
    .from(schema.clients)
    .where(eq(schema.clients.dni, "72365187"))
    .limit(1);

  if (!ivanClient && ivanUser) {
    [ivanClient] = await db
      .insert(schema.clients)
      .values({
        userId: ivanUser.id,
        firstName: "Ivan Daniel",
        lastName: "Manrique Roa",
        dni: "72365187",
        phone: "988111222",
        email: "ivan@test.com",
      })
      .returning();
  }

  if (ivanClient && lourdesId && corteService) {
    const [existingApt] = await db
      .select({ id: schema.appointments.id })
      .from(schema.appointments)
      .where(eq(schema.appointments.clientId, ivanClient.id))
      .limit(1);

    if (!existingApt) {
      const ivanPast = new Date();
      ivanPast.setDate(ivanPast.getDate() - 5);
      ivanPast.setHours(14, 0, 0, 0);
      const ivanEnd = new Date(ivanPast);
      ivanEnd.setHours(15, 0, 0, 0);

      const [ivanApt] = await db
        .insert(schema.appointments)
        .values({
          clientId: ivanClient.id,
          colaboradorId: lourdesId,
          startAt: ivanPast,
          endAt: ivanEnd,
          status: "completada",
          totalPrice: corteService.price,
        })
        .returning();

      if (ivanApt) {
        await db
          .insert(schema.appointmentServices)
          .values({
            appointmentId: ivanApt.id,
            serviceId: corteService.id,
            quantity: 1,
          });

        await db
          .insert(schema.reviews)
          .values({
            appointmentId: ivanApt.id,
            clientId: ivanClient.id,
            colaboradorId: lourdesId,
            serviceId: corteService.id,
            rating: 5,
            comment: "Excelente servicio, muy profesional y atenta. Quedé encantado con el resultado.",
            isPublic: true,
          });

        console.log("  Ivan: past completed appointment + review (5 stars)");
      }
    } else {
      console.log("  Ivan: appointment already exists, skipping");
    }
  }

  console.log("\n=== Seed completado ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
