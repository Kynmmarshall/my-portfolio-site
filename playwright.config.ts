import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  expect: { timeout: 15000 },
  workers: 1,
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000", viewport: { width: 1440, height: 900 }, trace: "retain-on-failure", screenshot: "only-on-failure", launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } },
  reporter: "list",
});