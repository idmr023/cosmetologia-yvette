import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "./db";
import { checkRateLimit, resetRateLimit } from "./security/rateLimit";
import { isLocked, recordFailedAttempt, recordSuccessAttempt } from "./security/lockout";
import { verifyTurnstile } from "./security/turnstile";
import { logAuthEvent } from "./security/audit";
import { getClientIP, getUserAgent } from "./security/request";

const LOGIN_RATE_LIMIT = { max: 10, windowMs: 15 * 60 * 1000 };

// Hash dummy para igualar tiempos cuando el usuario no existe (anti user-enumeration)
const DUMMY_HASH =
  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = await getClientIP();
        const userAgent = await getUserAgent();
        const email = credentials.email.toLowerCase().trim();

        // 1. Rate limit por IP (silencioso)
        const rl = checkRateLimit(ip, LOGIN_RATE_LIMIT);
        if (!rl.allowed) {
          await logAuthEvent({
            action: "LOGIN_RATE_BLOCKED",
            email,
            ip,
            userAgent,
            success: false,
          });
          return null;
        }

        // 2. Turnstile
        const turnstile = await verifyTurnstile(credentials.turnstileToken ?? null, ip);
        if (!turnstile.success) {
          await logAuthEvent({
            action: "TURNSTILE_FAILED",
            email,
            ip,
            userAgent,
            success: false,
          });
          return null;
        }

        // 3. Lockout por email (silencioso — mismo mensaje genérico)
        const { locked } = await isLocked(email);
        if (locked) {
          await recordFailedAttempt(email, ip);
          await logAuthEvent({
            action: "LOGIN_LOCKED",
            email,
            ip,
            userAgent,
            success: false,
          });
          return null;
        }

        // 4. Lookup user
        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email));

        // 5. Dummy bcrypt si no existe — iguala tiempos, anti user-enumeration
        if (!user?.passwordHash) {
          await bcrypt.compare(credentials.password, DUMMY_HASH);
          await recordFailedAttempt(email, ip);
          await logAuthEvent({
            action: "LOGIN_USER_NOT_FOUND",
            email,
            ip,
            userAgent,
            success: false,
          });
          return null;
        }

        // 6. Verificar password
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          await recordFailedAttempt(email, ip);
          await logAuthEvent({
            action: "LOGIN_PASSWORD_FAIL",
            userId: user.id,
            email,
            ip,
            userAgent,
            success: false,
          });
          return null;
        }

        // 7. Obtener colaboradorId si aplica
        let colaboradorId: string | undefined;
        if (user.role === "colaborador") {
          const [col] = await db
            .select({ id: schema.colaboradores.id })
            .from(schema.colaboradores)
            .where(eq(schema.colaboradores.userId, user.id));
          if (col) colaboradorId = col.id;
        }

        // 8. Exito
        resetRateLimit(ip, LOGIN_RATE_LIMIT);
        await recordSuccessAttempt(email, ip);
        await logAuthEvent({
          action: "LOGIN_SUCCESS",
          userId: user.id,
          email,
          ip,
          userAgent,
          success: true,
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          colaboradorId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.colaboradorId = user.colaboradorId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role ?? "cliente";
        session.user.colaboradorId = token.colaboradorId;
      }
      return session;
    },
  },
};
