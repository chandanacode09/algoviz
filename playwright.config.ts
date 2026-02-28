import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  timeout: 30000,
  retries: 0,
  use: {
    browserName: "chromium",
    headless: true,
    // Allow file:// protocol
    launchOptions: {
      args: ["--allow-file-access-from-files"],
    },
    screenshot: "off",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
