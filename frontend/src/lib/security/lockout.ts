import { eq, desc, and, gte } from "drizzle-orm";
import { db, schema } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30 * 60 * 1000;

export async function isLocked(email: string): Promise<{ locked: boolean; unlockAt?: Date }> {
  const since = new Date(Date.now() - LOCKOUT_MS);
  const recentFails = await db
    .select()
    .from(schema.loginAttempts)
    .where(
      and(
        eq(schema.loginAttempts.email, email.toLowerCase()),
        eq(schema.loginAttempts.success, false),
        gte(schema.loginAttempts.createdAt, since),
      ),
    )
    .orderBy(desc(schema.loginAttempts.createdAt));

  if (recentFails.length >= MAX_ATTEMPTS) {
    const lastFail = recentFails[0];
    const unlockAt = new Date(lastFail.createdAt.getTime() + LOCKOUT_MS);
    if (unlockAt > new Date()) {
      return { locked: true, unlockAt };
    }
  }
  return { locked: false };
}

export async function recordFailedAttempt(email: string, ip: string): Promise<void> {
  await db.insert(schema.loginAttempts).values({
    email: email.toLowerCase(),
    ip,
    success: false,
  });
}

export async function recordSuccessAttempt(email: string, ip: string): Promise<void> {
  await db.insert(schema.loginAttempts).values({
    email: email.toLowerCase(),
    ip,
    success: true,
  });
}

export async function getFailedCount(email: string): Promise<number> {
  const since = new Date(Date.now() - LOCKOUT_MS);
  const fails = await db
    .select()
    .from(schema.loginAttempts)
    .where(
      and(
        eq(schema.loginAttempts.email, email.toLowerCase()),
        eq(schema.loginAttempts.success, false),
        gte(schema.loginAttempts.createdAt, since),
      ),
    );
  return fails.length;
}
