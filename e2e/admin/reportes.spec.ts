import { test, expect } from "@playwright/test";

test.describe("Admin reportes", () => {
  test("loads reports page", async ({ page }) => {
    await page.goto("/admin/reportes");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });
});
