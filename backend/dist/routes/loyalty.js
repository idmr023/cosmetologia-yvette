"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.earnPoints = earnPoints;
exports.getOrCreatePoints = getOrCreatePoints;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
const POINTS_PER_SOL = 1;
const BIRTHDAY_BONUS = 50;
const REFERRAL_BONUS = 100;
const TIERS = [
    { name: "Bronce", minPoints: 0, discountPct: "0", color: "#CD7F32", benefits: ["Acceso a promociones"] },
    { name: "Plata", minPoints: 200, discountPct: "5", color: "#C0C0C0", benefits: ["5% descuento", "Prioridad en agenda"] },
    { name: "Oro", minPoints: 500, discountPct: "10", color: "#C9A227", benefits: ["10% descuento", "Prioridad en agenda", "Cumpleaños gratis"] },
];
let _seeded = false;
async function seedTiersIfEmpty() {
    if (_seeded)
        return;
    try {
        const existing = await db_1.db.select({ id: db_1.schema.loyaltyTiers.id }).from(db_1.schema.loyaltyTiers).limit(1);
        if (existing.length > 0) {
            _seeded = true;
            return;
        }
        for (const tier of TIERS) {
            await db_1.db.insert(db_1.schema.loyaltyTiers).values({
                name: tier.name,
                minPoints: tier.minPoints,
                discountPct: tier.discountPct,
                color: tier.color,
                benefits: tier.benefits,
            });
        }
        _seeded = true;
    }
    catch (e) {
        console.warn("[loyalty] seed skipped —", e.message);
    }
}
seedTiersIfEmpty();
async function getOrCreatePoints(clientId) {
    let [points] = await db_1.db
        .select()
        .from(db_1.schema.loyaltyPoints)
        .where((0, drizzle_orm_1.eq)(db_1.schema.loyaltyPoints.clientId, clientId))
        .limit(1);
    if (!points) {
        const tiers = await db_1.db
            .select()
            .from(db_1.schema.loyaltyTiers)
            .orderBy(db_1.schema.loyaltyTiers.minPoints);
        const [bronze] = tiers;
        [points] = await db_1.db
            .insert(db_1.schema.loyaltyPoints)
            .values({
            clientId,
            points: 0,
            totalEarned: 0,
            totalRedeemed: 0,
            tierId: bronze?.id ?? null,
        })
            .returning();
    }
    return points;
}
async function updateTier(clientId) {
    const pts = await getOrCreatePoints(clientId);
    const tiers = await db_1.db
        .select()
        .from(db_1.schema.loyaltyTiers)
        .orderBy((0, drizzle_orm_1.desc)(db_1.schema.loyaltyTiers.minPoints));
    const newTier = tiers.find((t) => pts.totalEarned >= t.minPoints);
    if (newTier && newTier.id !== pts.tierId) {
        await db_1.db
            .update(db_1.schema.loyaltyPoints)
            .set({ tierId: newTier.id })
            .where((0, drizzle_orm_1.eq)(db_1.schema.loyaltyPoints.clientId, clientId));
    }
}
async function earnPoints(clientId, appointmentId, amount) {
    const pts = Math.floor(amount * POINTS_PER_SOL);
    if (pts <= 0)
        return;
    const current = await getOrCreatePoints(clientId);
    await db_1.db
        .update(db_1.schema.loyaltyPoints)
        .set({
        points: (0, drizzle_orm_1.sql) `points + ${pts}`,
        totalEarned: (0, drizzle_orm_1.sql) `total_earned + ${pts}`,
        updatedAt: new Date(),
    })
        .where((0, drizzle_orm_1.eq)(db_1.schema.loyaltyPoints.clientId, clientId));
    await db_1.db.insert(db_1.schema.loyaltyTransactions).values({
        clientId,
        appointmentId,
        points: pts,
        type: "earn",
        description: `Puntos por compra de S/ ${amount.toFixed(2)}`,
    });
    await updateTier(clientId);
}
router.get("/tiers", async (req, res, next) => {
    try {
        const tiers = await db_1.db
            .select()
            .from(db_1.schema.loyaltyTiers)
            .orderBy(db_1.schema.loyaltyTiers.minPoints);
        res.json({ data: tiers });
    }
    catch (error) {
        next(error);
    }
});
router.post("/rewards", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const body = zod_1.z.object({
            name: zod_1.z.string().min(1),
            description: zod_1.z.string().optional(),
            pointsCost: zod_1.z.number().int().positive(),
            rewardType: zod_1.z.enum(["discount", "free_service", "product", "upgrade"]),
            rewardValue: zod_1.z.string().optional(),
        }).parse(req.body);
        const [reward] = await db_1.db
            .insert(db_1.schema.loyaltyRewards)
            .values({
            name: body.name,
            description: body.description,
            pointsCost: body.pointsCost,
            rewardType: body.rewardType,
            rewardValue: body.rewardValue,
        })
            .returning();
        res.status(201).json(reward);
    }
    catch (error) {
        next(error);
    }
});
router.patch("/rewards/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const { isActive } = zod_1.z.object({ isActive: zod_1.z.boolean() }).parse(req.body);
        const [updated] = await db_1.db
            .update(db_1.schema.loyaltyRewards)
            .set({ isActive })
            .where((0, drizzle_orm_1.eq)(db_1.schema.loyaltyRewards.id, req.params.id))
            .returning();
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
router.get("/points/:clientId", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador", "cliente"), async (req, res, next) => {
    try {
        const { clientId } = req.params;
        const points = await getOrCreatePoints(clientId);
        const [tier] = points.tierId
            ? await db_1.db.select().from(db_1.schema.loyaltyTiers).where((0, drizzle_orm_1.eq)(db_1.schema.loyaltyTiers.id, points.tierId)).limit(1)
            : [];
        const nextTier = tier
            ? await db_1.db
                .select()
                .from(db_1.schema.loyaltyTiers)
                .where((0, drizzle_orm_1.gt)(db_1.schema.loyaltyTiers.minPoints, points.totalEarned))
                .orderBy(db_1.schema.loyaltyTiers.minPoints)
                .limit(1)
                .then((rows) => rows[0])
            : null;
        const transactions = await db_1.db
            .select()
            .from(db_1.schema.loyaltyTransactions)
            .where((0, drizzle_orm_1.eq)(db_1.schema.loyaltyTransactions.clientId, clientId))
            .orderBy((0, drizzle_orm_1.desc)(db_1.schema.loyaltyTransactions.createdAt))
            .limit(20);
        res.json({
            points: points.points,
            totalEarned: points.totalEarned,
            totalRedeemed: points.totalRedeemed,
            tier: tier ? { id: tier.id, name: tier.name, color: tier.color, discountPct: tier.discountPct, benefits: tier.benefits } : null,
            nextTier: nextTier ? { name: nextTier.name, minPoints: nextTier.minPoints, pointsNeeded: nextTier.minPoints - points.totalEarned } : null,
            transactions,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/rewards", async (req, res, next) => {
    try {
        const rewards = await db_1.db
            .select()
            .from(db_1.schema.loyaltyRewards)
            .where((0, drizzle_orm_1.eq)(db_1.schema.loyaltyRewards.isActive, true));
        res.json({ data: rewards });
    }
    catch (error) {
        next(error);
    }
});
router.post("/redeem", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador", "cliente"), async (req, res, next) => {
    try {
        const { clientId, rewardId } = zod_1.z
            .object({ clientId: zod_1.z.string().uuid(), rewardId: zod_1.z.string().uuid() })
            .parse(req.body);
        const [reward] = await db_1.db
            .select()
            .from(db_1.schema.loyaltyRewards)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.loyaltyRewards.id, rewardId), (0, drizzle_orm_1.eq)(db_1.schema.loyaltyRewards.isActive, true)))
            .limit(1);
        if (!reward) {
            res.status(404).json({ error: "Recompensa no encontrada." });
            return;
        }
        const points = await getOrCreatePoints(clientId);
        if (points.points < reward.pointsCost) {
            res.status(400).json({ error: "Puntos insuficientes." });
            return;
        }
        const code = `RDM-${Date.now().toString(36).toUpperCase()}-${clientId.slice(0, 4).toUpperCase()}`;
        await db_1.db
            .update(db_1.schema.loyaltyPoints)
            .set({
            points: (0, drizzle_orm_1.sql) `points - ${reward.pointsCost}`,
            totalRedeemed: (0, drizzle_orm_1.sql) `total_redeemed + ${reward.pointsCost}`,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(db_1.schema.loyaltyPoints.clientId, clientId));
        await db_1.db.insert(db_1.schema.loyaltyTransactions).values({
            clientId,
            points: -reward.pointsCost,
            type: "redeem",
            description: `Canje: ${reward.name}`,
        });
        const [clientReward] = await db_1.db
            .insert(db_1.schema.clientRewards)
            .values({ clientId, rewardId, code })
            .returning();
        res.status(201).json(clientReward);
    }
    catch (error) {
        next(error);
    }
});
router.get("/referral/:clientId", auth_1.authenticate, async (req, res, next) => {
    try {
        const { clientId } = req.params;
        let [code] = await db_1.db
            .select()
            .from(db_1.schema.referralCodes)
            .where((0, drizzle_orm_1.eq)(db_1.schema.referralCodes.clientId, clientId))
            .limit(1);
        if (!code) {
            const genCode = `YV-${clientId.slice(0, 6).toUpperCase()}`;
            [code] = await db_1.db
                .insert(db_1.schema.referralCodes)
                .values({ clientId, code: genCode })
                .returning();
        }
        const usage = await db_1.db
            .select()
            .from(db_1.schema.referralUsage)
            .where((0, drizzle_orm_1.eq)(db_1.schema.referralUsage.referralCodeId, code.id))
            .orderBy((0, drizzle_orm_1.desc)(db_1.schema.referralUsage.createdAt));
        res.json({ code, usage });
    }
    catch (error) {
        next(error);
    }
});
const applyReferralSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    referredClientId: zod_1.z.string().uuid(),
});
router.post("/referral/apply", auth_1.authenticate, (0, auth_1.authorize)("admin", "colaborador", "cliente"), async (req, res, next) => {
    try {
        const { code, referredClientId } = applyReferralSchema.parse(req.body);
        const [referralCode] = await db_1.db
            .select()
            .from(db_1.schema.referralCodes)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.referralCodes.code, code), (0, drizzle_orm_1.eq)(db_1.schema.referralCodes.isActive, true)))
            .limit(1);
        if (!referralCode) {
            res.status(404).json({ error: "Código de referral no encontrado." });
            return;
        }
        if (referralCode.maxUses && referralCode.usageCount >= referralCode.maxUses) {
            res.status(400).json({ error: "Código de referral agotado." });
            return;
        }
        if (referralCode.clientId === referredClientId) {
            res.status(400).json({ error: "No puedes usar tu propio código." });
            return;
        }
        const [existingUse] = await db_1.db
            .select()
            .from(db_1.schema.referralUsage)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.referralUsage.referralCodeId, referralCode.id), (0, drizzle_orm_1.eq)(db_1.schema.referralUsage.referredClientId, referredClientId)))
            .limit(1);
        if (existingUse) {
            res.status(400).json({ error: "Ya usaste este código anteriormente." });
            return;
        }
        await db_1.db.insert(db_1.schema.referralUsage).values({
            referralCodeId: referralCode.id,
            referredClientId,
        });
        await db_1.db
            .update(db_1.schema.referralCodes)
            .set({ usageCount: (0, drizzle_orm_1.sql) `usage_count + 1` })
            .where((0, drizzle_orm_1.eq)(db_1.schema.referralCodes.id, referralCode.id));
        const referredPts = Math.floor(REFERRAL_BONUS / 2);
        const referrerPts = REFERRAL_BONUS;
        const referrerPtsRow = await getOrCreatePoints(referralCode.clientId);
        await db_1.db
            .update(db_1.schema.loyaltyPoints)
            .set({
            points: (0, drizzle_orm_1.sql) `points + ${referrerPts}`,
            totalEarned: (0, drizzle_orm_1.sql) `total_earned + ${referrerPts}`,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(db_1.schema.loyaltyPoints.clientId, referralCode.clientId));
        await db_1.db.insert(db_1.schema.loyaltyTransactions).values({
            clientId: referralCode.clientId,
            points: referrerPts,
            type: "earn",
            description: `Bono por referral de un nuevo cliente`,
        });
        const referredPtsRow = await getOrCreatePoints(referredClientId);
        await db_1.db
            .update(db_1.schema.loyaltyPoints)
            .set({
            points: (0, drizzle_orm_1.sql) `points + ${referredPts}`,
            totalEarned: (0, drizzle_orm_1.sql) `total_earned + ${referredPts}`,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(db_1.schema.loyaltyPoints.clientId, referredClientId));
        await db_1.db.insert(db_1.schema.loyaltyTransactions).values({
            clientId: referredClientId,
            points: referredPts,
            type: "earn",
            description: `Bono por ser referido`,
        });
        await updateTier(referralCode.clientId);
        await updateTier(referredClientId);
        res.status(201).json({ message: "Referral aplicado correctamente." });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=loyalty.js.map