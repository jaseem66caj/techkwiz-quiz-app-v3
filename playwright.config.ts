import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/__tests__/visual',
  snapshotDir: './src/__tests__/visual/baselines',
  timeout: 90 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }]
  ],
  use: {
    actionTimeout: 0,
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 }
      },
    },
    {
      name: 'tablet',
      use: { 
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 }
      },
    },
    {
      name: 'desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 }
      },
    },
  ],
  outputDir: 'test-results/',
});