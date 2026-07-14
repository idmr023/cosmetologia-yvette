import { db, schema } from "@/lib/db";

export async function getSetting(key: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, key));
  return row?.value ?? null;
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await db
    .select()
    .from(schema.settings);
  const map: Record<string, string> = {};
  for (const row of rows) {
    if (keys.includes(row.key)) {
      map[row.key] = row.value;
    }
  }
  return map;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(schema.settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: schema.settings.key,
      set: { value, updatedAt: new Date() },
    });
}

import { eq } from "drizzle-orm";