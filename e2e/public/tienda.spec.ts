import { test, expect } from "@playwright/test";

test.describe("Tienda (ecommerce)", () => {
  test("loads product catalog", async ({ page }) => {
    await page.goto("/tienda");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
  });
});
