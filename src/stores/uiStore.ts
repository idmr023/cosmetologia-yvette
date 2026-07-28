import { create } from "zustand";

interface UIState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
}

function getInitialDark(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
}

export const useUIStore = create<UIState>((set) => ({
  darkMode: getInitialDark(),
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", next ? "dark" : "light");
        document.documentElement.classList.toggle("dark", next);
      }
      return { darkMode: next };
    }),
  sheetOpen: false,
  setSheetOpen: (open) => set({ sheetOpen: open }),
}));

if (typeof window !== "undefined" && getInitialDark()) {
  document.documentElement.classList.add("dark");
}
