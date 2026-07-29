declare const router: import("express-serve-static-core").Router;
declare function getOrCreatePoints(clientId: string): Promise<{
    id: string;
    clientId: string;
    points: number;
    totalEarned: number;
    totalRedeemed: number;
    tierId: string | null;
    updatedAt: Date;
}>;
declare function earnPoints(clientId: string, appointmentId: string, amount: number): Promise<void>;
export { earnPoints, getOrCreatePoints };
export default router;
//# sourceMappingURL=loyalty.d.ts.map