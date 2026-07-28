import { test, expect } from "@playwright/test";

test.describe("Colaborador mis citas", () => {
  test.use({ storageState: "e2e/storage/colaborador.json" });

  test("loads my appointments", async ({ page }) => {
    await page.goto("/colaborador/mis-citas");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });
});
