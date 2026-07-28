import { chromium } from "@playwright/test";
import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const STORAGE_DIR = path.resolve(__dirname, "storage");

const USERS = [
  {
    role: "admin",
    email: "admin@yvette.com",
    password: "yvette2025",
    expectedPath: "/admin/inicio",
  },
  {
    role: "colaborador",
    email: "lourdes@yvette.com",
    password: "yvette2025",
    expectedPath: "/colaborador/mis-citas",
  },
];

async function globalSetup() {
  const browser = await chromium.launch();

  for (const user of USERS) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: "es-PE",
      timezoneId: "America/Lima",
    });
    const page = await context.newPage();

    try {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState("load");
      await page.waitForTimeout(500);

      await page.fill("#email", user.email);
      await page.fill("#password", user.password);

      await page.waitForTimeout(500);

      await page.getByRole("button", { name: "Ingresar" }).click();

      const errorShown = page.locator(".text-red-600");
      const hasError = await errorShown.isVisible({ timeout: 3000 }).catch(() => false);
      if (hasError) {
        const errText = await errorShown.textContent();
        const currentUrl = page.url();
        console.error(`Login error for ${user.email}: "${errText}" at ${currentUrl}`);
      }

      await page.waitForURL(`**${user.expectedPath}`, { timeout: 20000 });
      await context.storageState({ path: path.join(STORAGE_DIR, `${user.role}.json`) });
      console.log(`Auth setup complete for: ${user.role}`);
    } catch (err) {
      await page.screenshot({ path: path.join(STORAGE_DIR, `login-failed-${user.role}.png`), fullPage: true }).catch(() => {});
      const currentUrl = page.url();
      const bodyText = await page.locator("body").textContent().catch(() => "");
      console.error(`Auth FAILED for ${user.role} at ${currentUrl}. Body preview: ${bodyText.substring(0, 500)}`);
      throw err;
    } finally {
      await page.close();
      await context.close();
    }
  }

  await browser.close();
}

export default globalSetup;
