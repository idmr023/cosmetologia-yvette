import { test, expect } from "@playwright/test";

test.describe("Public review page", () => {
  test("invalid appointment shows error", async ({ page }) => {
    await page.goto("/review/invalid-id");
    await expect(page.getByText(/no encontrada|inválido|error/i)).toBeVisible({ timeout: 10000 });
  });
});
