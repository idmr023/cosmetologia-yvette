interface CircuitBreakerOptions {
    failureThreshold: number;
    recoveryTimeout: number;
    resetTimeout: number;
}
type CircuitState = "closed" | "open" | "half-open";
declare class CircuitBreaker {
    private state;
    private failureCount;
    private lastFailureTime;
    private readonly options;
    constructor(options?: Partial<CircuitBreakerOptions>);
    call<T>(fn: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    getState(): CircuitState;
}
declare function retry<T>(fn: () => Promise<T>, options?: {
    retries?: number;
    minTimeout?: number;
    maxTimeout?: number;
}): Promise<T>;
export { CircuitBreaker, retry };
export type { CircuitBreakerOptions };
//# sourceMappingURL=resilience.d.ts.map