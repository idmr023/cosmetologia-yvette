import { test, expect } from "@playwright/test";

test.describe("Admin citas", () => {
  test("loads appointment list", async ({ page }) => {
    await page.goto("/admin/citas");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });
});
