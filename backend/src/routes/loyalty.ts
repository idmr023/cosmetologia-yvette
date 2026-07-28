import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { db, schema } from "../lib/db";
import { eq, and, sql, desc, gte, gt } from "drizzle-orm";

const router = Router();

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
  if (_seeded) return;
  try {
    const existing = await db.select({ id: schema.loyaltyTiers.id }).from(schema.loyaltyTiers).limit(1);
    if (existing.length > 0) { _seeded = true; return; }
    for (const tier of TIERS) {
      await db.insert(schema.loyaltyTiers).values({
        name: tier.name,
        minPoints: tier.minPoints,
        discountPct: tier.discountPct,
        color: tier.color,
        benefits: tier.benefits,
      });
    }
    _seeded = true;
  } catch (e) {
    console.warn("[loyalty] seed skipped —", (e as Error).message);
  }
}

seedTiersIfEmpty();

async function getOrCreatePoints(clientId: string) {
  let [points] = await db
    .select()
    .from(schema.loyaltyPoints)
    .where(eq(schema.loyaltyPoints.clientId, clientId))
    .limit(1);

  if (!points) {
    const tiers = await db
      .select()
      .from(schema.loyaltyTiers)
      .orderBy(schema.loyaltyTiers.minPoints);
    const [bronze] = tiers;

    [points] = await db
      .insert(schema.loyaltyPoints)
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

async function updateTier(clientId: string) {
  const pts = await getOrCreatePoints(clientId);
  const tiers = await db
    .select()
    .from(schema.loyaltyTiers)
    .orderBy(desc(schema.loyaltyTiers.minPoints));

  const newTier = tiers.find((t) => pts.totalEarned >= t.minPoints);
  if (newTier && newTier.id !== pts.tierId) {
    await db
      .update(schema.loyaltyPoints)
      .set({ tierId: newTier.id })
      .where(eq(schema.loyaltyPoints.clientId, clientId));
  }
}

async function earnPoints(clientId: string, appointmentId: string, amount: number) {
  const pts = Math.floor(amount * POINTS_PER_SOL);
  if (pts <= 0) return;

  const current = await getOrCreatePoints(clientId);

  await db
    .update(schema.loyaltyPoints)
    .set({
      points: sql`points + ${pts}`,
      totalEarned: sql`total_earned + ${pts}`,
      updatedAt: new Date(),
    })
    .where(eq(schema.loyaltyPoints.clientId, clientId));

  await db.insert(schema.loyaltyTransactions).values({
    clientId,
    appointmentId,
    points: pts,
    type: "earn",
    description: `Puntos por compra de S/ ${amount.toFixed(2)}`,
  });

  await updateTier(clientId);
}

router.get(
  "/tiers",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tiers = await db
        .select()
        .from(schema.loyaltyTiers)
        .orderBy(schema.loyaltyTiers.minPoints);
      res.json({ data: tiers });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/rewards",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        pointsCost: z.number().int().positive(),
        rewardType: z.enum(["discount", "free_service", "product", "upgrade"]),
        rewardValue: z.string().optional(),
      }).parse(req.body);

      const [reward] = await db
        .insert(schema.loyaltyRewards)
        .values({
          name: body.name,
          description: body.description,
          pointsCost: body.pointsCost,
          rewardType: body.rewardType,
          rewardValue: body.rewardValue,
        })
        .returning();

      res.status(201).json(reward);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/rewards/:id",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
      const [updated] = await db
        .update(schema.loyaltyRewards)
        .set({ isActive })
        .where(eq(schema.loyaltyRewards.id, req.params.id))
        .returning();
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/points/:clientId",
  authenticate,
  authorize("admin", "colaborador", "cliente"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { clientId } = req.params;
      const points = await getOrCreatePoints(clientId);

      const [tier] = points.tierId
        ? await db.select().from(schema.loyaltyTiers).where(eq(schema.loyaltyTiers.id, points.tierId)).limit(1)
        : [];

      const nextTier = tier
        ? await db
            .select()
            .from(schema.loyaltyTiers)
            .where(gt(schema.loyaltyTiers.minPoints, points.totalEarned))
            .orderBy(schema.loyaltyTiers.minPoints)
            .limit(1)
            .then((rows) => rows[0])
        : null;

      const transactions = await db
        .select()
        .from(schema.loyaltyTransactions)
        .where(eq(schema.loyaltyTransactions.clientId, clientId))
        .orderBy(desc(schema.loyaltyTransactions.createdAt))
        .limit(20);

      res.json({
        points: points.points,
        totalEarned: points.totalEarned,
        totalRedeemed: points.totalRedeemed,
        tier: tier ? { id: tier.id, name: tier.name, color: tier.color, discountPct: tier.discountPct, benefits: tier.benefits } : null,
        nextTier: nextTier ? { name: nextTier.name, minPoints: nextTier.minPoints, pointsNeeded: nextTier.minPoints - points.totalEarned } : null,
        transactions,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/rewards",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rewards = await db
        .select()
        .from(schema.loyaltyRewards)
        .where(eq(schema.loyaltyRewards.isActive, true));
      res.json({ data: rewards });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/redeem",
  authenticate,
  authorize("admin", "colaborador", "cliente"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { clientId, rewardId } = z
        .object({ clientId: z.string().uuid(), rewardId: z.string().uuid() })
        .parse(req.body);

      const [reward] = await db
        .select()
        .from(schema.loyaltyRewards)
        .where(and(eq(schema.loyaltyRewards.id, rewardId), eq(schema.loyaltyRewards.isActive, true)))
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

      await db
        .update(schema.loyaltyPoints)
        .set({
          points: sql`points - ${reward.pointsCost}`,
          totalRedeemed: sql`total_redeemed + ${reward.pointsCost}`,
          updatedAt: new Date(),
        })
        .where(eq(schema.loyaltyPoints.clientId, clientId));

      await db.insert(schema.loyaltyTransactions).values({
        clientId,
        points: -reward.pointsCost,
        type: "redeem",
        description: `Canje: ${reward.name}`,
      });

      const [clientReward] = await db
        .insert(schema.clientRewards)
        .values({ clientId, rewardId, code })
        .returning();

      res.status(201).json(clientReward);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/referral/:clientId",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { clientId } = req.params;
      let [code] = await db
        .select()
        .from(schema.referralCodes)
        .where(eq(schema.referralCodes.clientId, clientId))
        .limit(1);

      if (!code) {
        const genCode = `YV-${clientId.slice(0, 6).toUpperCase()}`;
        [code] = await db
          .insert(schema.referralCodes)
          .values({ clientId, code: genCode })
          .returning();
      }

      const usage = await db
        .select()
        .from(schema.referralUsage)
        .where(eq(schema.referralUsage.referralCodeId, code.id))
        .orderBy(desc(schema.referralUsage.createdAt));

      res.json({ code, usage });
    } catch (error) {
      next(error);
    }
  },
);

const applyReferralSchema = z.object({
  code: z.string().min(1),
  referredClientId: z.string().uuid(),
});

router.post(
  "/referral/apply",
  authenticate,
  authorize("admin", "colaborador", "cliente"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, referredClientId } = applyReferralSchema.parse(req.body);

      const [referralCode] = await db
        .select()
        .from(schema.referralCodes)
        .where(and(
          eq(schema.referralCodes.code, code),
          eq(schema.referralCodes.isActive, true),
        ))
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

      const [existingUse] = await db
        .select()
        .from(schema.referralUsage)
        .where(and(
          eq(schema.referralUsage.referralCodeId, referralCode.id),
          eq(schema.referralUsage.referredClientId, referredClientId),
        ))
        .limit(1);

      if (existingUse) {
        res.status(400).json({ error: "Ya usaste este código anteriormente." });
        return;
      }

      await db.insert(schema.referralUsage).values({
        referralCodeId: referralCode.id,
        referredClientId,
      });

      await db
        .update(schema.referralCodes)
        .set({ usageCount: sql`usage_count + 1` })
        .where(eq(schema.referralCodes.id, referralCode.id));

      const referredPts = Math.floor(REFERRAL_BONUS / 2);
      const referrerPts = REFERRAL_BONUS;

      const referrerPtsRow = await getOrCreatePoints(referralCode.clientId);
      await db
        .update(schema.loyaltyPoints)
        .set({
          points: sql`points + ${referrerPts}`,
          totalEarned: sql`total_earned + ${referrerPts}`,
          updatedAt: new Date(),
        })
        .where(eq(schema.loyaltyPoints.clientId, referralCode.clientId));

      await db.insert(schema.loyaltyTransactions).values({
        clientId: referralCode.clientId,
        points: referrerPts,
        type: "earn",
        description: `Bono por referral de un nuevo cliente`,
      });

      const referredPtsRow = await getOrCreatePoints(referredClientId);
      await db
        .update(schema.loyaltyPoints)
        .set({
          points: sql`points + ${referredPts}`,
          totalEarned: sql`total_earned + ${referredPts}`,
          updatedAt: new Date(),
        })
        .where(eq(schema.loyaltyPoints.clientId, referredClientId));

      await db.insert(schema.loyaltyTransactions).values({
        clientId: referredClientId,
        points: referredPts,
        type: "earn",
        description: `Bono por ser referido`,
      });

      await updateTier(referralCode.clientId);
      await updateTier(referredClientId);

      res.status(201).json({ message: "Referral aplicado correctamente." });
    } catch (error) {
      next(error);
    }
  },
);

export { earnPoints, getOrCreatePoints };
export default router;