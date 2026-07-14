"use client";

import { Moon, Sun } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";

interface DarkModeToggleProps {
  className?: string;
}

export function DarkModeToggle({ className }: DarkModeToggleProps) {
  const { darkMode, toggleDarkMode } = useUIStore();

  return (
    <button
      onClick={toggleDarkMode}
      className={cn(
        "flex min-h-touch min-w-touch items-center justify-center rounded-lg text-neutral-400 transition-colors hover:text-ink dark:hover:text-white",
        className,
      )}
      title={darkMode ? "Modo claro" : "Modo oscuro"}
    >
      {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
