import { defineConfig, devices } from '@playwright/test';
import nextEnv from '@next/env';

/**
 * Load environment variables from .env files the same way Next.js does.
 * This ensures tests have access to the same env vars as the application.
 */
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

/**
 * Base URL for tests - configurable via PLAYWRIGHT_BASE_URL env var.
 * Defaults to Docker-based local dev URL, can be overridden for CI.
 */
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL || 'https://dev.docker.orb.local';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel (safe with unique test data) */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Use multiple workers for parallel execution */
  workers: process.env.CI ? 2 : undefined, // undefined = auto-detect CPU cores
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [['html'], ['@estruyf/github-actions-reporter']]
    : [['list'], ['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure for debugging */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
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
      use: {
        ...devices['Desktop Safari'],
        ignoreHTTPSErrors: true, // OrbStack uses self-signed certs for .orb.local
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
  timeout: 30000, // 30 seconds for each test
  /* Run your local dev server before starting the tests */
  webServer: {
    // In CI, run Next.js directly. Locally, use Docker via make dev
    command: process.env.CI ? 'pnpm dev' : 'make dev',
    // Health check URL matches the command - CI uses direct localhost, local uses Docker proxy
    url: process.env.CI ? 'http://localhost:3000' : 'http://localhost:80',
    timeout: 2 * 60000, // 2 minutes
    reuseExistingServer: !process.env.CI,
  },
});
