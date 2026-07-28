import { test, expect } from "@playwright/test";

test.describe("Admin analítica", () => {
  test("loads analytics dashboard", async ({ page }) => {
    await page.goto("/admin/analitica");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });
});
