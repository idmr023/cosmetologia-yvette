import "dotenv/config";
import { db, schema } from "../src/lib/db";
import { eq } from "drizzle-orm";

async function main() {
  const clients = await db
    .select()
    .from(schema.clients)
    .where(eq(schema.clients.userId, null))
    .limit(200);

  console.log(`Clientes sin userId: ${clients.length}`);

  let linked = 0;
  for (const c of clients) {
    if (!c.email) {
      console.log(`  ${c.firstName} ${c.lastName}: sin email, saltando`);
      continue;
    }
    const [user] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, c.email))
      .limit(1);

    if (user) {
      await db
        .update(schema.clients)
        .set({ userId: user.id })
        .where(eq(schema.clients.id, c.id));
      console.log(`  ${c.firstName} ${c.lastName} (${c.email}) → user ${user.id}`);
      linked++;
    } else {
      console.log(`  ${c.firstName} ${c.lastName} (${c.email}): sin user coincidente`);
    }
  }

  console.log(`\nVinculados: ${linked}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
