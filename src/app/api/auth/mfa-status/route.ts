import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  const [user] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase().trim()))
    .limit(1);

  if (!user) {
    return NextResponse.json({ mfaEnabled: false });
  }

  const [mfa] = await db
    .select({ isEnabled: schema.userMfa.isEnabled })
    .from(schema.userMfa)
    .where(eq(schema.userMfa.userId, user.id))
    .limit(1);

  return NextResponse.json({ mfaEnabled: mfa?.isEnabled ?? false });
}