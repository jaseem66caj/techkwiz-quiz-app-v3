// @ts-check
const { test, expect } = require('@playwright/test');

test('End-to-End User Experience Test', async ({ page }) => {
  // 1. Start the application
  await page.goto('http://localhost:3000');

  // 2. Complete the homepage quiz
  await page.click('text=Your vibe check: Pick your aesthetic');
  await page.click('text=Decode this viral trend: 💃🔥🎵');

  // 3. Create a profile
  await page.fill('#username', 'Test User');
  await page.click('text=🤖');
  await page.click('text=Create Profile');

  // 4. Navigate to the "Categories" page
  await page.click('text=Categories');

  // 5. Enter a category quiz
  await page.click('text=Programming');

  // 6. Answer a few questions
  await page.click('text=Which of the following is NOT a JavaScript data type?');
  await page.click('text=What does HTML stand for?');

  // 7. Navigate to the "Leaderboard" page
  await page.click('text=Leaderboard');
  await expect(page.locator('text=#1')).toBeVisible();

  // 8. Navigate to the "Profile" page
  await page.click('text=Profile');
  await expect(page.locator('text=Test User')).toBeVisible();
  await expect(page.locator('text=Level 1')).toBeVisible();
});
