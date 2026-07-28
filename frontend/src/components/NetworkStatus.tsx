"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSyncStore } from "@/stores/syncStore";

export function NetworkStatus() {
  const [online, setOnline] = useState(true);
  const [syncedCount, setSyncedCount] = useState(0);
  const [showSynced, setShowSynced] = useState(false);
  const process = useSyncStore((s) => s.process);
  const queueLength = useSyncStore((s) => s.queue.length);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => {
      setOnline(true);
      process();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [process]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "sync-complete") {
        setSyncedCount(event.data.synced);
        setShowSynced(true);
        setTimeout(() => setShowSynced(false), 3000);
      }
    }
    navigator.serviceWorker?.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker?.removeEventListener("message", handleMessage);
  }, []);

  if (!online && queueLength > 0) {
    return (
      <div
        className={cn(
          "fixed bottom-20 left-1/2 z-50 -translate-x-1/2",
          "rounded-full bg-ink/80 px-4 py-2 text-sm text-white shadow-lg",
          "backdrop-blur-sm md:bottom-6",
        )}
      >
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          Sin conexión · {queueLength} cambios pendientes
        </span>
      </div>
    );
  }

  if (!online) {
    return (
      <div
        className={cn(
          "fixed bottom-20 left-1/2 z-50 -translate-x-1/2",
          "rounded-full bg-ink/80 px-4 py-2 text-sm text-white shadow-lg",
          "backdrop-blur-sm md:bottom-6",
        )}
      >
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          Sin conexión
        </span>
      </div>
    );
  }

  if (showSynced && syncedCount > 0) {
    return (
      <div
        className={cn(
          "fixed bottom-20 left-1/2 z-50 -translate-x-1/2",
          "rounded-full bg-green-600/90 px-4 py-2 text-sm text-white shadow-lg",
          "backdrop-blur-sm md:bottom-6",
        )}
      >
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          {syncedCount} cambio{syncedCount > 1 ? "s" : ""} sincronizado{syncedCount > 1 ? "s" : ""}
        </span>
      </div>
    );
  }

  return null;
}
