export interface TurnstileVerifyResult {
    success: boolean;
    error?: string;
}
export declare function verifyTurnstile(token: string | null, ip?: string): Promise<TurnstileVerifyResult>;
//# sourceMappingURL=turnstile.d.ts.map