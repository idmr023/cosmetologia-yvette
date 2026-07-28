import { test, expect } from "@playwright/test";

test.describe("Admin colaboradores", () => {
  test("loads colaboradores list", async ({ page }) => {
    await page.goto("/admin/colaboradores");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });
});
