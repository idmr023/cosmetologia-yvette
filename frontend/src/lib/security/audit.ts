import { db, schema } from "@/lib/db";

interface AuditEvent {
  userId?: string | null;
  action: string;
  email?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  success?: boolean;
}

export async function logAuthEvent(event: AuditEvent): Promise<void> {
  try {
    await db.insert(schema.auditLog).values({
      userId: event.userId ?? null,
      action: event.action,
      email: event.email ?? null,
      ip: event.ip ?? null,
      userAgent: event.userAgent ?? null,
      success: event.success ?? true,
    });
  } catch {
    // Audit logging nunca debe romper el flujo de auth
  }
}
