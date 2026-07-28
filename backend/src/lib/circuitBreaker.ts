type AsyncFn<T> = (...args: unknown[]) => Promise<T>;

interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeoutMs?: number;
  fallback?: (...args: unknown[]) => Promise<unknown>;
}

enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

export function circuitBreaker<T>(fn: AsyncFn<T>, options: CircuitBreakerOptions = {}): AsyncFn<T> {
  const { failureThreshold = 5, resetTimeoutMs = 30_000, fallback } = options;
  let state = CircuitState.CLOSED;
  let failureCount = 0;
  let lastFailureTime = 0;

  return async function wrapped(...args: unknown[]): Promise<T> {
    if (state === CircuitState.OPEN) {
      if (Date.now() - lastFailureTime >= resetTimeoutMs) {
        state = CircuitState.HALF_OPEN;
      } else {
        if (fallback) return fallback(...args) as Promise<T>;
        throw new Error("CircuitBreaker: circuito abierto");
      }
    }

    try {
      const result = await fn(...args);
      if (state === CircuitState.HALF_OPEN) {
        state = CircuitState.CLOSED;
        failureCount = 0;
      }
      return result;
    } catch (err) {
      failureCount++;
      lastFailureTime = Date.now();
      if (failureCount >= failureThreshold) {
        state = CircuitState.OPEN;
      }
      if (fallback) return fallback(...args) as Promise<T>;
      throw err;
    }
  };
}

import { db } from "./db";

export const circuitQuery = circuitBreaker<unknown>(
  async (...args: unknown[]) => {
    const queryFn = args[0] as () => Promise<unknown>;
    return queryFn();
  },
  {
    failureThreshold: 3,
    resetTimeoutMs: 15_000,
    fallback: async () => {
      console.warn("[CircuitBreaker] Usando fallback — BD no disponible");
      return [];
    },
  },
);
