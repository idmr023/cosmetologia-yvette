import { create } from "zustand";
import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";
import { apiFetch } from "@/lib/api";

interface PendingMutation {
  id: string;
  endpoint: string;
  method: "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
  createdAt: number;
  retries: number;
}

interface SyncState {
  queue: PendingMutation[];
  isSyncing: boolean;
  add: (mutation: Omit<PendingMutation, "id" | "createdAt" | "retries">) => Promise<void>;
  process: () => Promise<void>;
  clear: () => Promise<void>;
  loadFromDb: () => Promise<void>;
}

const SYNC_KEY = "pws-sync-queue";
const MAX_RETRIES = 3;

export const useSyncStore = create<SyncState>((set, getState) => ({
  queue: [],
  isSyncing: false,

  add: async (mutation) => {
    const item: PendingMutation = {
      ...mutation,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      retries: 0,
    };
    const queue = [...getState().queue, item];
    set({ queue });
    await idbSet(SYNC_KEY, queue);

    if ("serviceWorker" in navigator && "SyncManager" in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await (reg as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register("sync-appointments");
      } catch {
        // Background sync not supported — process manually
        getState().process();
      }
    } else {
      getState().process();
    }
  },

  process: async () => {
    const { queue, isSyncing } = getState();
    if (isSyncing || queue.length === 0) return;

    set({ isSyncing: true });
    const remaining: PendingMutation[] = [];

    for (const mutation of queue) {
      try {
        const res = await apiFetch(mutation.endpoint, {
          method: mutation.method,
          body: mutation.body ? JSON.stringify(mutation.body) : undefined,
        });
        if (!res.ok && mutation.retries < MAX_RETRIES) {
          remaining.push({ ...mutation, retries: mutation.retries + 1 });
        }
      } catch {
        if (mutation.retries < MAX_RETRIES) {
          remaining.push({ ...mutation, retries: mutation.retries + 1 });
        }
      }
    }

    set({ queue: remaining, isSyncing: false });
    if (remaining.length > 0) {
      await idbSet(SYNC_KEY, remaining);
    } else {
      await idbDel(SYNC_KEY);
    }
  },

  clear: async () => {
    set({ queue: [] });
    await idbDel(SYNC_KEY);
  },

  loadFromDb: async () => {
    try {
      const stored = await idbGet<PendingMutation[]>(SYNC_KEY);
      if (stored && stored.length > 0) set({ queue: stored });
    } catch {
      // IndexedDB not available
    }
  },
}));
