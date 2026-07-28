import { test, expect } from "@playwright/test";

test.describe("Admin comisiones", () => {
  test("loads commissions page", async ({ page }) => {
    await page.goto("/admin/comisiones");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });
});
