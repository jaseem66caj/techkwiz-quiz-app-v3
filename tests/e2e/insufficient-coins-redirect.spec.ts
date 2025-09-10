import { test, expect } from '@playwright/test';

// Utility: seed localStorage user with insufficient coins before any scripts run
const seedUserWithCoins = (coins: number) => {
  const user = {
    id: 'guest',
    name: 'Guest',
    avatar: '🤖',
    coins,
    level: 1,
    totalQuizzes: 0,
    correctAnswers: 0,
    joinDate: new Date().toISOString(),
    quizHistory: [],
    streak: 0,
  };
  // This runs in the browser context
  // @ts-ignore
  window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
};

const categories = ['programming', 'ai', 'micro-trivia'];

test.describe('Insufficient Coins - Auto Redirect to Homepage Quiz', () => {
  for (const category of categories) {
    test(`Auto-redirect with countdown for ${category}`, async ({ page }) => {
      // Seed user with 0 coins before navigation
      await page.addInitScript(seedUserWithCoins, 0);

      await page.goto(`http://localhost:3000/quiz/${category}`);

      // Expect the insufficient coins message & countdown UI
      await expect(page.locator('text=Insufficient coins')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('text=Taking you to the homepage quiz where you can earn coins for free!')).toBeVisible();

      // Countdown should be visible and decreasing
      const countdownLocator = page.locator('text=Redirecting to homepage quiz in');
      await expect(countdownLocator).toBeVisible();

      // Optional: click the manual button to ensure fallback works
      const goNow = page.locator('text=Go to Homepage Quiz Now');
      if (await goNow.isVisible()) {
        await goNow.click();
      }

      // Verify we land on the homepage quiz
      await page.waitForURL('http://localhost:3000/**', { timeout: 10000 });
      // Check a unique homepage heading to confirm navigation
      await expect(page.locator('h1:has-text("Welcome to TechKwiz!")')).toBeVisible({ timeout: 10000 });
    });
  }
});

