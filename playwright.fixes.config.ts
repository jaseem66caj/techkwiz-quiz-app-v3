import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/fixes',
  timeout: 120_000,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: process.env.PLAY_BASE_URL || 'http://127.0.0.1:3025', trace: 'retain-on-failure', launchOptions: { executablePath: process.env.PLAY_CHROMIUM_PATH } },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1366, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
})
