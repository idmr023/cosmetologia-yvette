import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import argon2 from "argon2";
import bcrypt from "bcryptjs";
import { verify as verifyTotp } from "otplib";
import { db, schema } from "./db";
import { checkRateLimit, resetRateLimit } from "./security/rateLimit";
import { isLocked, recordFailedAttempt, recordSuccessAttempt } from "./security/lockout";
import { verifyTurnstile } from "./security/turnstile";
import { logAuthEvent } from "./security/audit";
import { getClientIP, getUserAgent } from "./security/request";

const LOGIN_RATE_LIMIT = { max: 10, windowMs: 15 * 60 * 1000 };

async function verifyPasswordFallback(password: string, hash: string | null): Promise<boolean> {
  if (!hash) return false;
  if (hash.startsWith("$argon2")) {
    try { return await argon2.verify(hash, password); } catch { return false; }
  }
  return bcrypt.compare(password, hash);
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" },
        mfaCode: { label: "MFA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = await getClientIP();
        const userAgent = await getUserAgent();
        const email = credentials.email.toLowerCase().trim();

        // Try backend first (dev mode with Express)
        try {
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password: credentials.password,
              turnstileToken: credentials.turnstileToken,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              colaboradorId: data.user.colaboradorId,
              clientId: data.user.clientId,
              accessToken: data.token,
              refreshToken: data.refreshToken,
            };
          }
        } catch {
          // Backend unavailable — fallback to direct DB (production)
        }

        // Fallback: direct DB authentication (production serverless)
        const rl = checkRateLimit(ip, LOGIN_RATE_LIMIT);
        if (!rl.allowed) {
          await logAuthEvent({ action: "LOGIN_RATE_BLOCKED", email, ip, userAgent, success: false });
          return null;
        }

        const turnstile = await verifyTurnstile(credentials.turnstileToken ?? null, ip);
        if (!turnstile.success) {
          await logAuthEvent({ action: "TURNSTILE_FAILED", email, ip, userAgent, success: false });
          return null;
        }

        const { locked } = await isLocked(email);
        if (locked) {
          await recordFailedAttempt(email, ip);
          await logAuthEvent({ action: "LOGIN_LOCKED", email, ip, userAgent, success: false });
          return null;
        }

        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email));

        if (!user?.passwordHash) {
          try { await argon2.hash("dummy"); } catch {}
          await recordFailedAttempt(email, ip);
          await logAuthEvent({ action: "LOGIN_USER_NOT_FOUND", email, ip, userAgent, success: false });
          return null;
        }

        const valid = await verifyPasswordFallback(credentials.password, user.passwordHash);
        if (!valid) {
          await recordFailedAttempt(email, ip);
          await logAuthEvent({ action: "LOGIN_PASSWORD_FAIL", userId: user.id, email, ip, userAgent, success: false });
          return null;
        }

        // MFA check
        const [mfaRecord] = await db
          .select({ secret: schema.userMfa.secret, isEnabled: schema.userMfa.isEnabled })
          .from(schema.userMfa)
          .where(eq(schema.userMfa.userId, user.id))
          .limit(1);

        if (mfaRecord?.isEnabled) {
          const codeIsValid = verifyTotp({ token: credentials.mfaCode ?? "", secret: mfaRecord.secret });
          if (!codeIsValid) {
            await logAuthEvent({ action: "LOGIN_MFA_FAIL", userId: user.id, email, ip, userAgent, success: false });
            return null;
          }
        }

        let colaboradorId: string | undefined;
        if (user.role === "colaborador") {
          const [col] = await db
            .select({ id: schema.colaboradores.id })
            .from(schema.colaboradores)
            .where(eq(schema.colaboradores.userId, user.id));
          if (col) colaboradorId = col.id;
        }

        let clientId: string | undefined;
        if (user.role === "cliente") {
          const [client] = await db
            .select({ id: schema.clients.id })
            .from(schema.clients)
            .where(eq(schema.clients.userId, user.id));
          if (client) clientId = client.id;
        }

        resetRateLimit(ip, LOGIN_RATE_LIMIT);
        await recordSuccessAttempt(email, ip);
        await logAuthEvent({ action: "LOGIN_SUCCESS", userId: user.id, email, ip, userAgent, success: true });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          colaboradorId,
          clientId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.colaboradorId = user.colaboradorId;
        token.clientId = user.clientId;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role ?? "cliente";
        session.user.colaboradorId = token.colaboradorId;
        session.user.clientId = token.clientId;
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
      }
      return session;
    },
  },
};
