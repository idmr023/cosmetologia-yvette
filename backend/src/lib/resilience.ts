import { setTimeout } from "timers/promises";

interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  resetTimeout: number;
}

type CircuitState = "closed" | "open" | "half-open";

class CircuitBreaker {
  private state: CircuitState = "closed";
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly options: CircuitBreakerOptions;

  constructor(options?: Partial<CircuitBreakerOptions>) {
    this.options = {
      failureThreshold: options?.failureThreshold ?? 5,
      recoveryTimeout: options?.recoveryTimeout ?? 30_000,
      resetTimeout: options?.resetTimeout ?? 60_000,
    };
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.options.recoveryTimeout) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === "half-open") {
      this.state = "closed";
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = "open";
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

async function retry<T>(
  fn: () => Promise<T>,
  options?: { retries?: number; minTimeout?: number; maxTimeout?: number },
): Promise<T> {
  const retries = options?.retries ?? 3;
  const minTimeout = options?.minTimeout ?? 500;
  const maxTimeout = options?.maxTimeout ?? 3000;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        const delay = Math.min(minTimeout * Math.pow(2, attempt), maxTimeout);
        await setTimeout(delay);
      }
    }
  }

  throw lastError;
}

export { CircuitBreaker, retry };
export type { CircuitBreakerOptions };
