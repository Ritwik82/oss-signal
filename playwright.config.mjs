import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
