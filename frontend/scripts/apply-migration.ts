import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync } from "fs";

async function main() {
  const { db } = await import("../src/lib/db");
  const { sql } = await import("drizzle-orm");
  const content = readFileSync("./backend/drizzle/0000_happy_gunslinger.sql", "utf-8");
  const statements = content
    .split(/;\s*-->\s*statement-breakpoint\s*\n?/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  let ok = 0, skip = 0, fail = 0;
  for (const stmt of statements) {
    try {
      await db.execute(sql.raw(stmt));
      ok++;
    } catch (e: any) {
      const code = e?.cause?.code || "";
      if (["42710", "42P07"].includes(code)) {
        skip++;
      } else {
        console.error("FAIL:", stmt.substring(0, 80));
        console.error("CODE:", code, e?.message?.substring(0, 120));
        fail++;
      }
    }
  }
  console.log(`Migration: ${ok} OK, ${skip} skipped, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
