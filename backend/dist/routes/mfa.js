"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const otplib_1 = require("otplib");
const qrcode_1 = __importDefault(require("qrcode"));
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../lib/db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const verifySchema = zod_1.z.object({
    code: zod_1.z.string().min(1, "Código requerido."),
});
const validateSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid("UserId inválido."),
    code: zod_1.z.string().min(1, "Código requerido."),
});
router.post("/setup", auth_1.authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const existing = await db_1.db
            .select()
            .from(db_1.schema.userMfa)
            .where((0, drizzle_orm_1.eq)(db_1.schema.userMfa.userId, userId))
            .limit(1);
        if (existing.length > 0 && existing[0].isEnabled) {
            res.status(409).json({ error: "MFA ya está habilitado." });
            return;
        }
        const [user] = await db_1.db
            .select({ email: db_1.schema.users.email })
            .from(db_1.schema.users)
            .where((0, drizzle_orm_1.eq)(db_1.schema.users.id, userId))
            .limit(1);
        if (!user) {
            res.status(404).json({ error: "Usuario no encontrado." });
            return;
        }
        const secret = (0, otplib_1.generateSecret)();
        const otpauth = (0, otplib_1.generateURI)({
            issuer: "Yvette Centro de Estética",
            label: user.email,
            secret,
        });
        const qrCodeUrl = await qrcode_1.default.toDataURL(otpauth);
        if (existing.length > 0) {
            await db_1.db
                .update(db_1.schema.userMfa)
                .set({ secret, isEnabled: false })
                .where((0, drizzle_orm_1.eq)(db_1.schema.userMfa.userId, userId));
        }
        else {
            await db_1.db.insert(db_1.schema.userMfa).values({ userId, secret });
        }
        res.json({ secret, qrCodeUrl });
    }
    catch (error) {
        next(error);
    }
});
router.post("/verify", auth_1.authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const body = verifySchema.parse(req.body);
        const [mfa] = await db_1.db
            .select()
            .from(db_1.schema.userMfa)
            .where((0, drizzle_orm_1.eq)(db_1.schema.userMfa.userId, userId))
            .limit(1);
        if (!mfa) {
            res.status(400).json({ error: "Primero ejecuta /setup." });
            return;
        }
        if (mfa.isEnabled) {
            res.status(409).json({ error: "MFA ya está habilitado." });
            return;
        }
        const result = await (0, otplib_1.verify)({ token: body.code, secret: mfa.secret });
        if (!result.valid) {
            res.status(401).json({ error: "Código inválido." });
            return;
        }
        await db_1.db
            .update(db_1.schema.userMfa)
            .set({ isEnabled: true })
            .where((0, drizzle_orm_1.eq)(db_1.schema.userMfa.userId, userId));
        res.json({ message: "MFA habilitado correctamente." });
    }
    catch (error) {
        next(error);
    }
});
router.post("/validate", async (req, res, next) => {
    try {
        const body = validateSchema.parse(req.body);
        const [mfa] = await db_1.db
            .select()
            .from(db_1.schema.userMfa)
            .where((0, drizzle_orm_1.eq)(db_1.schema.userMfa.userId, body.userId))
            .limit(1);
        if (!mfa || !mfa.isEnabled) {
            res.status(400).json({ error: "MFA no está habilitado para este usuario." });
            return;
        }
        const result = await (0, otplib_1.verify)({ token: body.code, secret: mfa.secret });
        if (!result.valid) {
            res.status(401).json({ error: "Código inválido." });
            return;
        }
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
router.get("/status", auth_1.authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [mfa] = await db_1.db
            .select({ isEnabled: db_1.schema.userMfa.isEnabled })
            .from(db_1.schema.userMfa)
            .where((0, drizzle_orm_1.eq)(db_1.schema.userMfa.userId, userId))
            .limit(1);
        res.json({ isEnabled: mfa?.isEnabled ?? false });
    }
    catch (error) {
        next(error);
    }
});
router.get("/check", async (req, res, next) => {
    try {
        const email = req.query.email;
        if (!email) {
            res.status(400).json({ error: "Email requerido" });
            return;
        }
        const [user] = await db_1.db
            .select({ id: db_1.schema.users.id })
            .from(db_1.schema.users)
            .where((0, drizzle_orm_1.eq)(db_1.schema.users.email, email.toLowerCase().trim()))
            .limit(1);
        if (!user) {
            res.json({ mfaEnabled: false });
            return;
        }
        const [mfa] = await db_1.db
            .select({ isEnabled: db_1.schema.userMfa.isEnabled })
            .from(db_1.schema.userMfa)
            .where((0, drizzle_orm_1.eq)(db_1.schema.userMfa.userId, user.id))
            .limit(1);
        res.json({ mfaEnabled: mfa?.isEnabled ?? false });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=mfa.js.map