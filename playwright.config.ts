import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { config } from "dotenv";

config({ path: ".env.local" });

const ENV_VARS = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "CORS_ORIGIN",
  "WHATSAPP_NUMBER",
];

const env: Record<string, string> = {
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
};

for (const v of ENV_VARS) {
  if (process.env[v]) env[v] = process.env[v];
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],
  globalSetup: path.resolve(__dirname, "e2e/auth.setup.ts"),

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        locale: "es-PE",
        timezoneId: "America/Lima",
        viewport: { width: 1280, height: 720 },
        storageState: "e2e/storage/admin.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        locale: "es-PE",
        timezoneId: "America/Lima",
        storageState: "e2e/storage/admin.json",
      },
      dependencies: ["setup"],
    },
  ],

  webServer: [
    {
      command: "npm run dev",
      url: "http://localhost:3000",
      cwd: path.resolve(__dirname, "frontend"),
      reuseExistingServer: false,
      timeout: 120000,
      env,
    },
    {
      command: "npm run dev",
      url: "http://localhost:4000/api/health",
      cwd: path.resolve(__dirname, "backend"),
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
