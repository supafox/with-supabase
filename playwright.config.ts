import { defineConfig, devices } from "@playwright/test"

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build if you accidentally left test.only in the source code. */
  forbidOnly: false,
  /* Retry on failures */
  retries: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.argv.includes("--list")
    ? [["list"], ["html", { open: process.env.CI ? "never" : "on-failure" }]]
    : [
        ["./tests/reporter.ts"],
        [
          "html",
          {
            open: process.env.CI ? "never" : "on-failure",
          },
        ],
      ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Capture screenshot after each test */
    screenshot: "only-on-failure",

    /* Capture video after each test */
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  /* Run your production server before starting the tests */
  webServer: {
    command: "pnpm build && pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180000, // 3 minutes for build + start
    stdout: "pipe",
    stderr: "pipe",
  },
})
