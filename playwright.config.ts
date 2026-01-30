import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Test timeout: 30s per test (reasonable for slow networks) */
  timeout: 30000,
  /* Global timeout: 5 minutes total per test file */
  globalTimeout: 5 * 60 * 1000,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { open: 'never' }], // Generate HTML report for CI artifacts (never auto-open)
    ['line'], // Console output for CI logs
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Action timeout: 10s (prevent long hangs on single actions) */
    actionTimeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Auth-seeded projects
    {
      name: 'chromium (seeded)',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/state.json',
      },
    },
    {
      name: 'firefox (seeded)',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'tests/e2e/.auth/state.json',
      },
    },
    {
      name: 'webkit (seeded)',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'tests/e2e/.auth/state.json',
      },
    },

    // Unauthenticated projects
    {
      name: 'chromium (unauth)',
      use: {
        ...devices['Desktop Chrome'],
        storageState: undefined,
      },
    },
    {
      name: 'firefox (unauth)',
      use: {
        ...devices['Desktop Firefox'],
        storageState: undefined,
      },
    },
    {
      name: 'webkit (unauth)',
      use: {
        ...devices['Desktop Safari'],
        storageState: undefined,
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minute timeout for server startup
    // Suppress NextAuth JWT decryption warnings (expected in tests with mocked auth)
    stderr: 'pipe',
    stdout: 'ignore',
    // Pass through test-related environment variables to dev server
    env: {
      ENABLE_TEST_SESSION_SEED: process.env.ENABLE_TEST_SESSION_SEED || '',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
    },
  },
});
