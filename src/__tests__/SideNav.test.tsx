import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

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

vi.mock("@/components/DarkModeToggle", () => ({
  DarkModeToggle: () => React.createElement("span", null, "dark-toggle"),
}));

import { SideNav } from "@/components/navigation/SideNav";

describe("SideNav", () => {
  it("renders admin nav items", () => {
    render(React.createElement(SideNav, { role: "admin" }));
    expect(screen.getByText("Inicio")).toBeDefined();
    expect(screen.getByText("Citas")).toBeDefined();
    expect(screen.getByText("Clientes")).toBeDefined();
    expect(screen.getByText("Servicios")).toBeDefined();
    expect(screen.getByText("Colaboradoras")).toBeDefined();
  });

  it("renders colaborador nav items", () => {
    render(React.createElement(SideNav, { role: "colaborador" }));
    expect(screen.getByText("Mis Citas")).toBeDefined();
    expect(screen.getByText("Escanear")).toBeDefined();
    expect(screen.getByText("Cajas")).toBeDefined();
    expect(screen.getByText("Perfil")).toBeDefined();
  });

  it("renders cliente nav items", () => {
    render(React.createElement(SideNav, { role: "cliente" }));
    expect(screen.getByText("Inicio")).toBeDefined();
    expect(screen.getByText("Mis Citas")).toBeDefined();
    expect(screen.getByText("Fidelización")).toBeDefined();
    expect(screen.getByText("Mis Órdenes")).toBeDefined();
    expect(screen.getByText("Mis Reseñas")).toBeDefined();
    expect(screen.getByText("Perfil")).toBeDefined();
  });

  it("highlights active link", () => {
    render(React.createElement(SideNav, { role: "admin" }));
    const inicioLink = screen.getByText("Inicio").closest("a");
    expect(inicioLink?.className).toContain("bg-gold/10");
  });
});
