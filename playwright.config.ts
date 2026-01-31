import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Visual regression testing configuration
  expect: {
    toHaveScreenshot: {
      // An acceptable ratio of pixels that are different to the total amount of pixels
      threshold: 0.3,
      // An acceptable amount of pixels that could be different
      maxDiffPixels: 1000,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Visual regression tests only run on chromium for consistency
    {
      name: 'visual',
      testDir: './e2e/visual',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm start',
    port: 3000,
    reuseExistingServer: true,
  },
});
