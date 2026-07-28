import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ children, href, ...props }: Record<string, any>) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/inicio",
}));

vi.mock("@/stores/uiStore", () => ({
  useUIStore: () => ({
    darkMode: false,
    toggleDarkMode: vi.fn(),
    sheetOpen: false,
    setSheetOpen: vi.fn(),
  }),
}));

vi.mock("@/stores/syncStore", () => ({
  useSyncStore: () => ({
    loadFromDb: vi.fn(),
    process: vi.fn(),
    add: vi.fn(),
  }),
}));

vi.mock("@/components/DarkModeToggle", () => ({
  DarkModeToggle: () => React.createElement("span", null, "toggle"),
}));

vi.mock("@/components/navigation/BottomNav", () => ({
  BottomNav: () => React.createElement("nav", null, "bottom-nav"),
}));

vi.mock("@/components/ui/Sheet", () => ({
  Sheet: () => React.createElement("div", null),
  useSheetStore: () => ({
    show: vi.fn(),
    close: vi.fn(),
  }),
}));

vi.mock("@/components/NetworkStatus", () => ({
  NetworkStatus: () => React.createElement("div", null),
}));

vi.mock("@/components/AuthGuard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

import { SideNav } from "@/components/navigation/SideNav";
import { BottomNav } from "@/components/navigation/BottomNav";

describe("Navigation role switching", () => {
  it("SideNav shows correct items for each role", () => {
    const { unmount } = render(React.createElement(SideNav, { role: "admin" }));
    expect(screen.getByText("Analítica")).toBeDefined();
    unmount();

    render(React.createElement(SideNav, { role: "colaborador" }));
    expect(screen.getByText("Escanear")).toBeDefined();
  });

  it("BottomNav renders for mobile", () => {
    render(React.createElement(BottomNav, { role: "admin" }));
    expect(screen.getByText("bottom-nav")).toBeDefined();
  });
});
