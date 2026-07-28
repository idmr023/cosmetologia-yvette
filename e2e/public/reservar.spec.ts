import { test, expect } from "@playwright/test";

test.describe("Public booking flow", () => {
  test("booking page loads", async ({ page }) => {
    await page.goto("/reservar");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });
});
