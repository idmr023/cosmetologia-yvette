import { test, expect } from "@playwright/test";

test.describe("Admin clientes", () => {
  test("loads client list", async ({ page }) => {
    await page.goto("/admin/clientes");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });
});
