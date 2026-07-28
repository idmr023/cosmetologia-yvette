import { LRUCache } from "lru-cache";

interface RateLimitOptions {
  max: number;
  windowMs: number;
}

const caches = new Map<string, LRUCache<string, number>>();

function getCache(key: string, opts: RateLimitOptions): LRUCache<string, number> {
  let cache = caches.get(key);
  if (!cache) {
    cache = new LRUCache<string, number>({
      max: 10000,
      ttl: opts.windowMs,
    });
    caches.set(key, cache);
  }
  return cache;
}

export function checkRateLimit(
  identifier: string,
  opts: RateLimitOptions,
): { allowed: boolean; remaining: number; resetMs: number } {
  const cache = getCache(`${opts.max}:${opts.windowMs}`, opts);
  const current = cache.get(identifier) ?? 0;

  if (current >= opts.max) {
    const resetMs = cache.getRemainingTTL(identifier) || opts.windowMs;
    return { allowed: false, remaining: 0, resetMs };
  }

  cache.set(identifier, current + 1);
  return { allowed: true, remaining: opts.max - current - 1, resetMs: opts.windowMs };
}

export function resetRateLimit(identifier: string, opts: RateLimitOptions): void {
  const cache = getCache(`${opts.max}:${opts.windowMs}`, opts);
  cache.delete(identifier);
}
