import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Dropping public schema...");
  await sql`DROP SCHEMA public CASCADE`;
  console.log("Recreating public schema...");
  await sql`CREATE SCHEMA public`;
  console.log("Done. Schema is clean.");
}

main().catch(console.error);
