import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['**/production-*.spec.ts', '**/homepage-quiz-*.spec.ts', '**/quiz-completion-*.spec.ts'],
  timeout: 120 * 1000, // 2 minutes per test
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report-production' }],
    ['json', { outputFile: 'test-results-production.json' }],
    ['list']
  ],
  use: {
    actionTimeout: 15000,
    navigationTimeout: 30000,
    // No baseURL - tests will use full production URLs
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Ignore HTTPS errors for production testing
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'production-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 }
      },
    },
    {
      name: 'production-mobile',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 }
      },
    },
    {
      name: 'production-tablet',
      use: { 
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 }
      },
    },
  ],
  outputDir: 'test-results-production/',
  
  // No webServer for production testing - we test the live site
});
