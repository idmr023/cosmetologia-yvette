import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db, schema } = await import("../src/lib/db");
  const { SEED_SERVICES, SEED_COLABORADORAS } = await import("../src/lib/seed/services");
  const bcrypt = (await import("bcryptjs")).default;

  console.log("Seeding database...");

  const adminEmail = "admin@yvette.com";
  const adminPass = "yvette2025";
  const hash = await bcrypt.hash(adminPass, 10);

  const [admin] = await db
    .insert(schema.users)
    .values({
      email: adminEmail,
      passwordHash: hash,
      name: "Yvette Roa",
      phone: "991697726",
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  if (admin) {
    await db
      .insert(schema.colaboradores)
      .values({
        userId: admin.id,
        fullName: "Yvette Roa de Burga",
        phone: "991697726",
        specialty: "Dirección y Estética Facial",
        commissionPct: "0",
        isAvailable: true,
        colorTag: "#C9A227",
      })
      .onConflictDoNothing();
  }

  for (const col of SEED_COLABORADORAS.filter(
    (c) => c.fullName !== "Yvette Roa de Burga",
  )) {
    const [user] = await db
      .insert(schema.users)
      .values({
        email: `${col.fullName.split(" ")[0].toLowerCase()}@yvette.com`,
        passwordHash: hash,
        name: col.fullName,
        phone: col.phone,
        role: "colaborador",
      })
      .onConflictDoNothing()
      .returning();

    if (user) {
      await db
        .insert(schema.colaboradores)
        .values({
          userId: user.id,
          fullName: col.fullName,
          phone: col.phone,
          specialty: col.specialty,
          commissionPct: "40",
          isAvailable: true,
        })
        .onConflictDoNothing();
    }
  }

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

  console.log("Seed completado.");
  console.log(`Admin: ${adminEmail} / ${adminPass}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
