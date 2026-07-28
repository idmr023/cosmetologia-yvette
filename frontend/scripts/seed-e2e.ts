import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db, schema } = await import("../src/lib/db");
  const { SEED_SERVICES, SEED_COLABORADORAS } = await import("../src/lib/seed/services");
  const bcrypt = (await import("bcryptjs")).default;
  const { eq } = await import("drizzle-orm");

  console.log("=== Seeding E2E test data ===\n");

  const hash = await bcrypt.hash("yvette2025", 10);

  // --- 1. Admin user ---
  console.log("Creating admin user...");
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

  // --- 2. Colaborador users ---
  const colabUsers: Record<string, typeof schema.users.$inferSelect> = {};
  for (const colab of SEED_COLABORADORAS.filter((c) => c.fullName !== "Yvette Roa de Burga")) {
    const email = `${colab.fullName.split(" ")[0].toLowerCase()}@yvette.com`;
    const [user] = await db
      .insert(schema.users)
      .values({
        email,
        passwordHash: hash,
        name: colab.fullName,
        phone: colab.phone,
        role: "colaborador",
      })
      .onConflictDoNothing()
      .returning();
    if (user) colabUsers[user.email] = user;
  }
  console.log(`  Admin: admin@yvette.com / yvette2025`);
  console.log(`  Colaborador: lourdes@yvette.com / yvette2025`);

  // --- 3. Colaboradores records ---
  console.log("Creating colaborador records...");
  const lourdesUser = colabUsers["lourdes@yvette.com"];
  const elizabethUser = colabUsers["elizabeth@yvette.com"];
  let lourdesId: string | undefined;
  let elizabethId: string | undefined;

  if (lourdesUser) {
    const [col] = await db
      .insert(schema.colaboradores)
      .values({
        userId: lourdesUser.id,
        fullName: "Lourdes Roa Prado",
        phone: "989284171",
        specialty: "Laceados y Tratamientos",
        commissionPct: "40",
        isAvailable: true,
        colorTag: "#E8A0BF",
      })
      .onConflictDoNothing()
      .returning();
    if (col) lourdesId = col.id;
  }

  if (elizabethUser) {
    const [col] = await db
      .insert(schema.colaboradores)
      .values({
        userId: elizabethUser.id,
        fullName: "Elizabeth Roa Prado",
        phone: "989187417",
        specialty: "Peluquería y Color",
        commissionPct: "40",
        isAvailable: true,
        colorTag: "#B8D4E3",
      })
      .onConflictDoNothing()
      .returning();
    if (col) elizabethId = col.id;
  }

  // Fetch existing if insert skipped
  if (!lourdesId) {
    const [col] = await db
      .select({ id: schema.colaboradores.id })
      .from(schema.colaboradores)
      .where(eq(schema.colaboradores.fullName, "Lourdes Roa Prado"))
      .limit(1);
    if (col) lourdesId = col.id;
  }
  if (!elizabethId) {
    const [col] = await db
      .select({ id: schema.colaboradores.id })
      .from(schema.colaboradores)
      .where(eq(schema.colaboradores.fullName, "Elizabeth Roa Prado"))
      .limit(1);
    if (col) elizabethId = col.id;
  }

  // --- 4. Services ---
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
  console.log(`  ${SEED_SERVICES.length} services`);

  // Fetch some services for appointments
  const [corte] = await db
    .select({ id: schema.services.id, price: schema.services.price })
    .from(schema.services)
    .where(eq(schema.services.name, "Corte de cabello"))
    .limit(1);

  const [tinte] = await db
    .select({ id: schema.services.id, price: schema.services.price })
    .from(schema.services)
    .where(eq(schema.services.name, "Tinte"))
    .limit(1);

  // --- 5. E2E test client ---
  console.log("Creating test client...");
  const [clientUser] = await db
    .insert(schema.users)
    .values({
      email: "cliente@test.com",
      passwordHash: hash,
      name: "María Gonzalez",
      phone: "999888777",
      role: "cliente",
    })
    .onConflictDoNothing()
    .returning();

  let clientId: string | undefined;
  if (clientUser) {
    const [cl] = await db
      .insert(schema.clients)
      .values({
        userId: clientUser.id,
        firstName: "María",
        lastName: "Gonzalez",
        dni: "12345678",
        phone: "999888777",
        email: "maria@test.com",
      })
      .onConflictDoNothing()
      .returning();
    if (cl) clientId = cl.id;
  }

  if (!clientId) {
    const [cl] = await db
      .select({ id: schema.clients.id })
      .from(schema.clients)
      .where(eq(schema.clients.dni, "12345678"))
      .limit(1);
    if (cl) clientId = cl.id;
  }

  // --- 6. Past completed appointment (for review testing) ---
  if (clientId && lourdesId && corte) {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    d.setHours(10, 0, 0, 0);
    const e = new Date(d);
    e.setHours(11, 0, 0, 0);

    const [apt] = await db
      .insert(schema.appointments)
      .values({
        clientId,
        colaboradorId: lourdesId,
        startAt: d,
        endAt: e,
        status: "completada",
        totalPrice: corte.price,
      })
      .onConflictDoNothing()
      .returning();
    if (apt) {
      await db.insert(schema.appointmentServices).values({ appointmentId: apt.id, serviceId: corte.id, quantity: 1 }).onConflictDoNothing();
    }
    console.log("  Past completed appointment for review testing");
  }

  // --- 7. Future pending appointment ---
  if (clientId && elizabethId && tinte) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(15, 0, 0, 0);
    const e = new Date(d);
    e.setHours(16, 30, 0, 0);

    const [apt] = await db
      .insert(schema.appointments)
      .values({
        clientId,
        colaboradorId: elizabethId,
        startAt: d,
        endAt: e,
        status: "pendiente",
        totalPrice: tinte.price,
      })
      .onConflictDoNothing()
      .returning();
    if (apt) {
      await db.insert(schema.appointmentServices).values({ appointmentId: apt.id, serviceId: tinte.id, quantity: 1 }).onConflictDoNothing();
    }
    console.log("  Future pending appointment");
  }

  // --- 8. Sample review ---
  if (clientId && lourdesId && corte) {
    const [completedApt] = await db
      .select({ id: schema.appointments.id })
      .from(schema.appointments)
      .where(eq(schema.appointments.clientId, clientId))
      .limit(1);
    if (completedApt) {
      await db
        .insert(schema.reviews)
        .values({
          appointmentId: completedApt.id,
          clientId,
          colaboradorId: lourdesId,
          serviceId: corte.id,
          rating: 5,
          comment: "Excelente servicio, muy profesional y atenta. Quedé encantada con el resultado.",
          isPublic: true,
        })
        .onConflictDoNothing();
    }
    console.log("  Sample 5-star review");
  }

  // --- 9. Inventory for testing ---
  console.log("Creating inventory...");
  await db.insert(schema.inventory).values({
    name: "Shampoo Profesional",
    type: "uso",
    category: "Cuidado Capilar",
    stockQty: 15,
    minStock: 5,
    unitPrice: "25.00",
    supplier: "Proveedor A",
  }).onConflictDoNothing();
  await db.insert(schema.inventory).values({
    name: "Acondicionador Profesional",
    type: "uso",
    category: "Cuidado Capilar",
    stockQty: 3,
    minStock: 5,
    unitPrice: "28.00",
    supplier: "Proveedor A",
  }).onConflictDoNothing();
  await db.insert(schema.inventory).values({
    name: "Crema para Peinar",
    type: "venta",
    category: "Productos",
    stockQty: 20,
    minStock: 10,
    unitPrice: "35.00",
    supplier: "Proveedor B",
  }).onConflictDoNothing();
  await db.insert(schema.inventory).values({
    name: "Aceite de Argan",
    type: "venta",
    category: "Productos",
    stockQty: 8,
    minStock: 10,
    unitPrice: "45.00",
    supplier: "Proveedor B",
  }).onConflictDoNothing();
  console.log("  4 inventory items (2 low stock)");

  // --- 10. Loyalty tiers ---
  console.log("Creating loyalty tiers...");
  await db.insert(schema.loyaltyTiers).values({ name: "Bronce", minPoints: 0, discountPct: "0", color: "#CD7F32" }).onConflictDoNothing();
  await db.insert(schema.loyaltyTiers).values({ name: "Plata", minPoints: 200, discountPct: "5", color: "#C0C0C0" }).onConflictDoNothing();
  await db.insert(schema.loyaltyTiers).values({ name: "Oro", minPoints: 500, discountPct: "10", color: "#FFD700" }).onConflictDoNothing();
  console.log("  3 loyalty tiers");

  console.log("\n=== E2E Seed completado ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed E2E error:", err);
  process.exit(1);
});
