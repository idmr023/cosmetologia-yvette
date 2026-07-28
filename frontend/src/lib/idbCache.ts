import { get, set, del } from "idb-keyval";

const CACHE_PREFIX = "api-cache-";
const DEFAULT_TTL = 5 * 60 * 1000;

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const entry = await get<{ data: T; timestamp: number }>(CACHE_PREFIX + key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > DEFAULT_TTL) {
      await del(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, data: T): Promise<void> {
  try {
    await set(CACHE_PREFIX + key, { data, timestamp: Date.now() });
  } catch {
    // IndexedDB may be unavailable
  }
}

export async function cacheInvalidate(pattern?: string): Promise<void> {
  try {
    const keys = await (await import("idb-keyval")).keys();
    const toRemove = pattern
      ? keys.filter((k) => String(k).startsWith(CACHE_PREFIX + pattern))
      : keys.filter((k) => String(k).startsWith(CACHE_PREFIX));
    await Promise.all(toRemove.map((k) => del(k)));
  } catch {
    // ignore
  }
}
