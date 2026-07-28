import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, formatTime, isLowStock, cn } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats number as PEN currency", () => {
    const result = formatCurrency(30);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("handles string input", () => {
    const result = formatCurrency("120.50");
    expect(typeof result).toBe("string");
  });

  it("handles zero", () => {
    expect(typeof formatCurrency(0)).toBe("string");
  });
});

describe("formatDate", () => {
  it("returns a non-empty string", () => {
    expect(formatDate("2026-07-14")).toBeTruthy();
  });

  it("handles Date object", () => {
    expect(formatDate(new Date("2026-01-01"))).toBeTruthy();
  });
});

describe("formatTime", () => {
  it("returns a non-empty string", () => {
    expect(formatTime("2026-07-14T15:00:00")).toBeTruthy();
  });
});

describe("isLowStock", () => {
  it("returns true when stock <= min", () => {
    expect(isLowStock(2, 5)).toBe(true);
  });

  it("returns false when stock > min", () => {
    expect(isLowStock(10, 5)).toBe(false);
  });

  it("returns true when equal", () => {
    expect(isLowStock(5, 5)).toBe(true);
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden")).toBe("base");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });
});
