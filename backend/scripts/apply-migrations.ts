import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

config({ path: join(__dirname, "..", ".env") });

const sql = neon(process.env.DATABASE_URL!);
const DRIZZLE_DIR = join(__dirname, "..", "drizzle");

function raw(s: string) {
  return sql.unsafe(s);
}

async function ensureLogTable() {
  await sql`CREATE TABLE IF NOT EXISTS _migrations_log (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT now() NOT NULL
  )`;
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const result = await sql`SELECT filename FROM _migrations_log`;
  if (!result || !Array.isArray(result)) return new Set();
  return new Set(result.map((r: any) => r.filename));
}

async function markApplied(filename: string) {
  await sql`INSERT INTO _migrations_log (filename) VALUES (${filename})`;
}

async function applyMigration(filename: string) {
  const filePath = join(DRIZZLE_DIR, filename);
  if (!existsSync(filePath)) {
    console.error(`  Migration file not found: ${filename}`);
    return;
  }

  const rawSQL = readFileSync(filePath, "utf-8");
  const statements = rawSQL
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`  ${filename} (${statements.length} stmts):`);
  const total = statements.length;

  const ok: number[] = [];
  const warn: number[] = [];

  for (let i = 0; i < total; i++) {
    try {
      await sql`${raw(statements[i])}`;
      ok.push(i + 1);
    } catch (e: any) {
      const code = e?.code || "";
      const msg = e?.message || "";
      const isDuplicate = msg.includes("already exists") || code === "42710" || code === "42P07";
      if (isDuplicate) {
        warn.push(i + 1);
      } else {
        console.error(`  ERROR [${i + 1}/${total}]: ${msg.slice(0, 200)}`);
        throw e;
      }
    }
  }

  console.log(`    ok: ${ok.length}  warn: ${warn.length}  err: ${total - ok.length - warn.length}`);
  if (warn.length > 0) {
    console.log(`    skipped (already exist): stmts ${warn.slice(0, 10).join(",")}${warn.length > 10 ? "..." : ""}`);
  }

  await markApplied(filename);
}

async function main() {
  const action = process.argv[2] || "apply";

  if (action === "generate") {
    console.log("Generating migrations from schema...");
    execSync("npx drizzle-kit generate", { cwd: join(__dirname, ".."), stdio: "inherit" });
  }

  const journalPath = join(DRIZZLE_DIR, "meta", "_journal.json");
  if (!existsSync(journalPath)) {
    console.log("No migrations journal found. Run `npm run db:apply generate` first.");
    return;
  }

  const journal = JSON.parse(readFileSync(journalPath, "utf-8"));
  const entries: { tag: string; idx: number }[] = journal.entries || [];

  if (entries.length === 0) {
    console.log("No migrations to apply.");
    return;
  }

  console.log("Ensuring migrations log table...");
  await ensureLogTable();

  const applied = await getAppliedMigrations();
  if (applied.size > 0) console.log(`Already applied: ${applied.size} migration(s)`);

  let pending = 0;
  for (const entry of entries) {
    const filename = `${entry.tag}.sql`;
    if (applied.has(filename)) {
      console.log(`  SKIP ${filename}`);
      continue;
    }
    pending++;
    await applyMigration(filename);
  }

  if (pending === 0) {
    console.log("Schema is up to date.");
  } else {
    console.log(`\nApplied ${pending} migration(s).`);
  }
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
