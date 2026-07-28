import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("next/link", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ children, href, ...props }: Record<string, any>) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const mockToggle = vi.fn();

vi.mock("@/stores/uiStore", () => ({
  useUIStore: () => ({
    darkMode: false,
    toggleDarkMode: mockToggle,
    sheetOpen: false,
    setSheetOpen: vi.fn(),
  }),
}));

import { DarkModeToggle } from "@/components/DarkModeToggle";

describe("DarkModeToggle", () => {
  beforeEach(() => {
    mockToggle.mockClear();
  });

  it("renders with correct title in light mode", () => {
    render(React.createElement(DarkModeToggle));
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
    expect(button.getAttribute("title")).toBe("Modo oscuro");
  });

  it("calls toggleDarkMode on click", () => {
    render(React.createElement(DarkModeToggle));
    fireEvent.click(screen.getByRole("button"));
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});
