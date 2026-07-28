import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { sql } = await import("drizzle-orm");
  await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text;`);
  await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pendiente';`);
  await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at timestamp;`);
  console.log("Columns added successfully");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
