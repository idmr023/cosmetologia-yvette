import { test, expect } from "@playwright/test";

test.describe("Admin fidelización", () => {
  test("loads loyalty management page", async ({ page }) => {
    await page.goto("/admin/fidelizacion");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });
});
