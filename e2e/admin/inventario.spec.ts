import { test, expect } from "@playwright/test";

test.describe("Admin inventario", () => {
  test("loads inventory page", async ({ page }) => {
    await page.goto("/admin/inventario");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });
});
