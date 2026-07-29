"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const turnstile_1 = require("../middleware/turnstile");
const router = (0, express_1.Router)();
const ARGON2_OPTIONS = {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
};
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email inválido."),
    password: zod_1.z.string().min(1, "Contraseña requerida."),
    turnstileToken: zod_1.z.string().nullable().optional(),
});
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email inválido."),
    password: zod_1.z.string().min(8, "Mínimo 8 caracteres."),
    name: zod_1.z.string().min(1, "Nombre requerido."),
    dni: zod_1.z.string().regex(/^\d{8}$/),
    phone: zod_1.z.string().optional(),
    securityQuestion: zod_1.z.string().optional(),
    securityAnswer: zod_1.z.string().optional(),
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
});
const recoverySchema = zod_1.z.object({
    email: zod_1.z.string().email("Email inválido."),
});
const answerSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email inválido."),
    answer: zod_1.z.string().min(1, "Respuesta requerida."),
});
const resetSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email inválido."),
    newPassword: zod_1.z.string().min(8, "Mínimo 8 caracteres."),
});
async function isRateLimited(email) {
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recent = await db_1.db
        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
        .from(db_1.schema.loginAttempts)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.loginAttempts.email, email), (0, drizzle_orm_1.gte)(db_1.schema.loginAttempts.createdAt, fifteenMinAgo)));
    return recent[0].count >= 10;
}
async function isLockedOut(email) {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const failed = await db_1.db
        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
        .from(db_1.schema.loginAttempts)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.loginAttempts.email, email), (0, drizzle_orm_1.eq)(db_1.schema.loginAttempts.success, false), (0, drizzle_orm_1.gte)(db_1.schema.loginAttempts.createdAt, thirtyMinAgo)));
    return failed[0].count >= 5;
}
async function recordLoginAttempt(email, ip, success) {
    await db_1.db.insert(db_1.schema.loginAttempts).values({ email, ip, success });
}
async function verifyPassword(password, hash) {
    if (!hash)
        return false;
    return bcryptjs_1.default.compare(password, hash);
}
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 10);
}
function generateTokens(user) {
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, colaboradorId: user.colaboradorId, clientId: user.clientId }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = crypto_1.default.randomBytes(40).toString("hex");
    const refreshTokenHash = crypto_1.default.createHash("sha256").update(refreshToken).digest("hex");
    return { accessToken, refreshToken, refreshTokenHash };
}
async function getColaboradorId(userId) {
    const [col] = await db_1.db
        .select({ id: db_1.schema.colaboradores.id })
        .from(db_1.schema.colaboradores)
        .where((0, drizzle_orm_1.eq)(db_1.schema.colaboradores.userId, userId))
        .limit(1);
    return col?.id;
}
async function getClientId(userId) {
    const [client] = await db_1.db
        .select({ id: db_1.schema.clients.id })
        .from(db_1.schema.clients)
        .where((0, drizzle_orm_1.eq)(db_1.schema.clients.userId, userId))
        .limit(1);
    return client?.id;
}
async function tryMigrateToArgon2(userId, password) {
    // No-op for bcrypt migration
}
router.post("/login", async (req, res, next) => {
    try {
        const body = loginSchema.parse(req.body);
        const turnstile = await (0, turnstile_1.verifyTurnstile)(body.turnstileToken ?? null, req.ip);
        if (!turnstile.success) {
            res.status(400).json({ error: turnstile.error ?? "Verificación Turnstile fallida." });
            return;
        }
        if (await isRateLimited(body.email)) {
            await recordLoginAttempt(body.email, req.ip || "", false);
            res.status(429).json({ error: "Demasiados intentos. Espere 15 minutos." });
            return;
        }
        if (await isLockedOut(body.email)) {
            res.status(423).json({ error: "Cuenta bloqueada por 30 minutos." });
            return;
        }
        const [user] = await db_1.db
            .select()
            .from(db_1.schema.users)
            .where((0, drizzle_orm_1.eq)(db_1.schema.users.email, body.email))
            .limit(1);
        if (!user || !user.passwordHash) {
            // Dummy hash — anti user-enumeration
            try {
                await bcryptjs_1.default.hash("dummy", 10);
            }
            catch { }
            await recordLoginAttempt(body.email, req.ip || "", false);
            res.status(401).json({ error: "Credenciales inválidas." });
            return;
        }
        const valid = await verifyPassword(body.password, user.passwordHash);
        if (!valid) {
            await recordLoginAttempt(body.email, req.ip || "", false);
            res.status(401).json({ error: "Credenciales inválidas." });
            return;
        }
        await recordLoginAttempt(body.email, req.ip || "", true);
        // Migrate bcrypt → argon2 on successful login
        await tryMigrateToArgon2(user.id, body.password);
        const colaboradorId = user.role !== "cliente" ? await getColaboradorId(user.id) : undefined;
        const clientId = user.role === "cliente" ? await getClientId(user.id) : undefined;
        const { accessToken, refreshToken, refreshTokenHash } = generateTokens({
            id: user.id,
            email: user.email,
            role: user.role,
            colaboradorId,
            clientId,
        });
        // Store refresh token hash
        await db_1.db.insert(db_1.schema.refreshTokens).values({
            userId: user.id,
            tokenHash: refreshTokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        res.json({
            token: accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
                avatarUrl: user.avatarUrl,
                colaboradorId,
                clientId,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/refresh", async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token requerido." });
            return;
        }
        const tokenHash = crypto_1.default.createHash("sha256").update(refreshToken).digest("hex");
        const [stored] = await db_1.db
            .select()
            .from(db_1.schema.refreshTokens)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.refreshTokens.tokenHash, tokenHash), (0, drizzle_orm_1.eq)(db_1.schema.refreshTokens.isRevoked, false), (0, drizzle_orm_1.gte)(db_1.schema.refreshTokens.expiresAt, new Date())))
            .limit(1);
        if (!stored) {
            res.status(401).json({ error: "Refresh token inválido o expirado." });
            return;
        }
        // Revoke old refresh token (rotation)
        await db_1.db
            .update(db_1.schema.refreshTokens)
            .set({ isRevoked: true })
            .where((0, drizzle_orm_1.eq)(db_1.schema.refreshTokens.id, stored.id));
        const [user] = await db_1.db
            .select()
            .from(db_1.schema.users)
            .where((0, drizzle_orm_1.eq)(db_1.schema.users.id, stored.userId))
            .limit(1);
        if (!user) {
            res.status(401).json({ error: "Usuario no encontrado." });
            return;
        }
        const colaboradorId = user.role !== "cliente" ? await getColaboradorId(user.id) : undefined;
        const clientId = user.role === "cliente" ? await getClientId(user.id) : undefined;
        const tokens = generateTokens({
            id: user.id,
            email: user.email,
            role: user.role,
            colaboradorId,
            clientId,
        });
        await db_1.db.insert(db_1.schema.refreshTokens).values({
            userId: user.id,
            tokenHash: tokens.refreshTokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        res.json({
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/register", async (req, res, next) => {
    try {
        const body = registerSchema.parse(req.body);
        const existing = await db_1.db
            .select({ id: db_1.schema.users.id })
            .from(db_1.schema.users)
            .where((0, drizzle_orm_1.eq)(db_1.schema.users.email, body.email))
            .limit(1);
        if (existing.length > 0) {
            res.status(409).json({ error: "El email ya está registrado." });
            return;
        }
        const [existingClient] = await db_1.db
            .select()
            .from(db_1.schema.clients)
            .where((0, drizzle_orm_1.eq)(db_1.schema.clients.dni, body.dni))
            .limit(1);
        if (existingClient?.userId) {
            res.status(409).json({ error: "El DNI ya está vinculado a una cuenta." });
            return;
        }
        const passwordHash = await hashPassword(body.password);
        const securityAnswerHash = body.securityAnswer
            ? await hashPassword(body.securityAnswer)
            : null;
        const [user] = await db_1.db
            .insert(db_1.schema.users)
            .values({
            email: body.email,
            passwordHash,
            name: body.name,
            phone: body.phone,
            role: "cliente",
            securityQuestion: body.securityQuestion || null,
            securityAnswerHash,
        })
            .returning();
        // Auto-create linked client record
        const nameParts = body.name.split(" ");
        const firstName = body.firstName || nameParts[0] || body.name;
        const lastName = body.lastName || nameParts.slice(1).join(" ") || body.name;
        const client = existingClient
            ? (await db_1.db
                .update(db_1.schema.clients)
                .set({ userId: user.id })
                .where((0, drizzle_orm_1.eq)(db_1.schema.clients.id, existingClient.id))
                .returning())[0]
            : (await db_1.db
                .insert(db_1.schema.clients)
                .values({
                userId: user.id,
                firstName,
                lastName,
                dni: body.dni,
                phone: body.phone || body.email,
                email: body.email,
            })
                .returning())[0];
        res.status(201).json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            clientId: client.id,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/recuperar/get-question", async (req, res, next) => {
    try {
        const body = recoverySchema.parse(req.body);
        const [user] = await db_1.db
            .select({ securityQuestion: db_1.schema.users.securityQuestion })
            .from(db_1.schema.users)
            .where((0, drizzle_orm_1.eq)(db_1.schema.users.email, body.email))
            .limit(1);
        if (!user || !user.securityQuestion) {
            res.status(404).json({ error: "No se encontró pregunta de seguridad." });
            return;
        }
        res.json({ question: user.securityQuestion });
    }
    catch (error) {
        next(error);
    }
});
router.post("/recuperar/verify-answer", async (req, res, next) => {
    try {
        const body = answerSchema.parse(req.body);
        const [user] = await db_1.db
            .select({ securityAnswerHash: db_1.schema.users.securityAnswerHash })
            .from(db_1.schema.users)
            .where((0, drizzle_orm_1.eq)(db_1.schema.users.email, body.email))
            .limit(1);
        if (!user || !user.securityAnswerHash) {
            res.status(404).json({ error: "No se encontró pregunta de seguridad." });
            return;
        }
        const valid = await verifyPassword(body.answer, user.securityAnswerHash);
        if (!valid) {
            res.status(401).json({ error: "Respuesta incorrecta." });
            return;
        }
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
router.post("/recuperar/reset-password", async (req, res, next) => {
    try {
        const body = resetSchema.parse(req.body);
        const passwordHash = await hashPassword(body.newPassword);
        const [user] = await db_1.db
            .update(db_1.schema.users)
            .set({ passwordHash })
            .where((0, drizzle_orm_1.eq)(db_1.schema.users.email, body.email))
            .returning({ id: db_1.schema.users.id });
        if (!user) {
            res.status(404).json({ error: "Usuario no encontrado." });
            return;
        }
        res.json({ message: "Contraseña actualizada correctamente." });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map