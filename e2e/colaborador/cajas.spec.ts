import { test, expect } from "@playwright/test";

test.describe("Colaborador cajas", () => {
  test.use({ storageState: "e2e/storage/colaborador.json" });

  test("loads cash register page", async ({ page }) => {
    await page.goto("/colaborador/cajas");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });
});
