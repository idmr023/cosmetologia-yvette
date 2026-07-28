import { test, expect } from "@playwright/test";

test.describe("Admin dashboard", () => {
  test("loads admin page", async ({ page }) => {
    await page.goto("/admin/inicio");
    await expect(page).toHaveURL(/\/admin\/inicio/);
  });
});
