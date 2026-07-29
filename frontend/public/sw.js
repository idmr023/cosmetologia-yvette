const CACHE_NAME = "yvette-cache-v1";
const API_CACHE = "yvette-api-v1";
const STATIC_CACHE = "yvette-static-v1";

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
];

const API_CACHE_PATHS = [
  "/api/services",
  "/api/appointments",
  "/api/clients",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE && k !== STATIC_CACHE)
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (API_CACHE_PATHS.some((path) => url.pathname.startsWith(path))) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    request.destination === "image"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithCache(request, CACHE_NAME));
    return;
  }
});

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    if (request.mode === "navigate") {
      const root = await caches.match("/");
      if (root) return root;
    }

    return new Response(JSON.stringify({ error: "Sin conexión" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const url = new URL(request.url);
    if (!url.protocol.startsWith('http')) return fetch(request);
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 408 });
  }
}

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-appointments") {
    event.waitUntil(syncPendingMutations());
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "process-sync-queue") {
    syncPendingMutations();
  }
});

function openDB() {
  return new Promise((resolve, reject) => {
    const req = self.indexedDB.open("yvette-sync", 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllFromStore(db) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains("sync-queue")) {
      resolve([]);
      return;
    }
    const tx = db.transaction("sync-queue", "readonly");
    const store = tx.objectStore("sync-queue");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function deleteFromStore(db, id) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains("sync-queue")) {
      resolve();
      return;
    }
    const tx = db.transaction("sync-queue", "readwrite");
    const store = tx.objectStore("sync-queue");
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function syncPendingMutations() {
  try {
    const db = await openDB();
    const mutations = await getAllFromStore(db);

    for (const mutation of mutations) {
      try {
        const headers = { "Content-Type": "application/json" };
        const res = await fetch(mutation.endpoint, {
          method: mutation.method,
          headers,
          body: mutation.body ? JSON.stringify(mutation.body) : undefined,
        });

        if (res.ok) {
          await deleteFromStore(db, mutation.id);
        }
      } catch {
        // Keep failed mutations for next sync attempt
      }
    }

    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({ type: "sync-complete", synced: mutations.length });
    }
  } catch {
    // IndexedDB not available or error
  }
}
