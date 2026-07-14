"use client";

import { create } from "zustand";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetStore {
  open: boolean;
  content: React.ReactNode | null;
  show: (content: React.ReactNode) => void;
  close: () => void;
}

export const useSheetStore = create<SheetStore>((set) => ({
  open: false,
  content: null,
  show: (content) => set({ open: true, content }),
  close: () => set({ open: false, content: null }),
}));

export function Sheet() {
  const { open, content, close } = useSheetStore();

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-ink/40 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={close}
      />
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-300" />
        <button
          onClick={close}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex min-h-touch min-w-touch items-center justify-center rounded-lg text-neutral-400"
        >
          <X className="h-5 w-5" />
        </button>
        {content}
      </div>
    </div>
  );
}
