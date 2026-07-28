"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
exports.retry = retry;
const promises_1 = require("timers/promises");
class CircuitBreaker {
    state = "closed";
    failureCount = 0;
    lastFailureTime = 0;
    options;
    constructor(options) {
        this.options = {
            failureThreshold: options?.failureThreshold ?? 5,
            recoveryTimeout: options?.recoveryTimeout ?? 30_000,
            resetTimeout: options?.resetTimeout ?? 60_000,
        };
    }
    async call(fn) {
        if (this.state === "open") {
            if (Date.now() - this.lastFailureTime > this.options.recoveryTimeout) {
                this.state = "half-open";
            }
            else {
                throw new Error("Circuit breaker is open");
            }
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        if (this.state === "half-open") {
            this.state = "closed";
        }
    }
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.options.failureThreshold) {
            this.state = "open";
        }
    }
    getState() {
        return this.state;
    }
}
exports.CircuitBreaker = CircuitBreaker;
async function retry(fn, options) {
    const retries = options?.retries ?? 3;
    const minTimeout = options?.minTimeout ?? 500;
    const maxTimeout = options?.maxTimeout ?? 3000;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt < retries) {
                const delay = Math.min(minTimeout * Math.pow(2, attempt), maxTimeout);
                await (0, promises_1.setTimeout)(delay);
            }
        }
    }
    throw lastError;
}
//# sourceMappingURL=resilience.js.map