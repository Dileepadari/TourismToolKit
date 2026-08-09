import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests.
 *
 * These need the full stack: `docker compose up -d` (or the backend on :8000)
 * before running. CI starts Postgres + the backend as services.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  // `github` annotates the diff; `html` is what makes a CI failure diagnosable
  // afterwards. Without it no playwright-report/ is written at all, so the
  // upload-artifact step silently uploaded nothing.
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
