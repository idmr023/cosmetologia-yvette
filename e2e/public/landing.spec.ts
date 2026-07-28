import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads and displays hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("services nav link is present", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: "Servicios" }).first();
    await expect(link).toBeVisible();
  });

  test("reservar button navigates", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/reservar"]').first().click();
    await expect(page).toHaveURL(/\/reservar/);
  });
});
