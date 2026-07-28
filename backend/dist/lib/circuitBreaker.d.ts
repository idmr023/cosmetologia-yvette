type AsyncFn<T> = (...args: unknown[]) => Promise<T>;
interface CircuitBreakerOptions {
    failureThreshold?: number;
    resetTimeoutMs?: number;
    fallback?: (...args: unknown[]) => Promise<unknown>;
}
export declare function circuitBreaker<T>(fn: AsyncFn<T>, options?: CircuitBreakerOptions): AsyncFn<T>;
export declare const circuitQuery: AsyncFn<unknown>;
export {};
//# sourceMappingURL=circuitBreaker.d.ts.map