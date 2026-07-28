import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  console.log("Borrando schema public de Neon...");
  await sql`DROP SCHEMA IF EXISTS public CASCADE;`;
  await sql`CREATE SCHEMA public;`;
  await sql`GRANT ALL ON SCHEMA public TO public;`;
  console.log("Schema public recreado. Listo para db:push.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});