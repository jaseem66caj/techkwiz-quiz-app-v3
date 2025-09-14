import { test, expect } from '@playwright/test';

test('Debug reward popup appearance', async ({ page }) => {
  // Visit the technology quiz page
  await page.goto('http://localhost:3002/quiz/technology');

  // Wait for interface to be ready
  await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });
  await page.waitForSelector('[data-testid="question-text"]', { timeout: 5000 });

  // Click first answer
  await page.waitForSelector('[data-testid="answer-option"]', { timeout: 5000 });
  const answerOptions = page.locator('[data-testid="answer-option"]');
  await answerOptions.first().click();

  // Wait for the reward popup to appear (with longer timeout)
  await page.waitForTimeout(1000);
  
  // Check if any reward popup elements are visible
  const claimButton = page.locator('text=Claim');
  const skipNowButton = page.locator('text=Skip Now');
  const rewardButton = page.locator('[data-testid="reward-claim-button"]');
  
  const claimVisible = await claimButton.isVisible();
  const skipVisible = await skipNowButton.isVisible();
  const rewardButtonVisible = await rewardButton.isVisible();
  
  console.log('Claim button visible:', claimVisible);
  console.log('Skip Now button visible:', skipVisible);
  console.log('Reward button visible:', rewardButtonVisible);
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/debug-reward-popup.png' });
  
  // Expect at least one of the reward popup elements to be visible
  expect(claimVisible || skipVisible || rewardButtonVisible).toBeTruthy();
});