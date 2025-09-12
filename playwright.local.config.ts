import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['**/local-navigation-test.spec.ts'],
  timeout: 120 * 1000, // 2 minutes per test
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report-local' }],
    ['json', { outputFile: 'test-results-local.json' }],
    ['list']
  ],
  use: {
    actionTimeout: 15000,
    navigationTimeout: 30000,
    baseURL: 'http://localhost:3003',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'local-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 }
      },
    },
  ],
  outputDir: 'test-results-local/',
  
  // No webServer for local testing - we'll connect to the existing dev server
});