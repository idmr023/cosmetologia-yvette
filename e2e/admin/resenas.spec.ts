import { test, expect } from "@playwright/test";

test.describe("Admin reseñas", () => {
  test("loads reviews management", async ({ page }) => {
    await page.goto("/admin/resenas");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });
});
