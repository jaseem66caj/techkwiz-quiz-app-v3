import { test, expect } from '@playwright/test';

const categories = ['technology', 'science', 'mathematics'];

async function waitForRewardPopup(page) {
  // Check for any of the expected popup buttons within ~1500ms to account for the 400ms delay
  const selectors = [
    'text=Skip Now',
    'text=Continue',
    'text=Claim',
    '[data-testid="reward-claim-button"]'
  ];
  for (const sel of selectors) {
    try {
      // Wait for selector with a longer timeout to account for the 400ms delay
      await page.waitForSelector(sel, { timeout: 1500 });
      return sel;
    } catch {
      // Continue to next selector
    }
  }
  // If we still haven't found it, let's check what's actually on the page
  const pageContent = await page.content();
  console.log('Page content when looking for reward popup:', pageContent.substring(0, 1000));
  return null;
}

test.describe('Category Quiz – Fresh Load RewardPopup & Progression', () => {
  for (const category of categories) {
    test(`Fresh load: ${category} shows reward popup fast and progresses`, async ({ page }) => {
      // Ensure user has enough coins before starting the quiz
      await page.addInitScript(() => {
        // Create a user with sufficient coins
        const user = {
          id: 'test-user',
          name: 'Test User',
          avatar: 'robot',
          coins: 200, // More than enough for the quiz
          level: 1,
          totalQuizzes: 0,
          correctAnswers: 0,
          joinDate: new Date().toISOString(),
          quizHistory: [],
          streak: 0
        };
        localStorage.setItem('techkwiz_user', JSON.stringify(user));
      });

      // Fresh visit (not a reload)
      await page.goto(`http://localhost:3002/quiz/${category}`);

      // Observe console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Wait for interface to be ready
      await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });
      await page.waitForSelector('[data-testid="question-text"]', { timeout: 5000 });

      // Verify header shows Question 1
      const questionHeader = page.locator('text=Question 1 of');
      await expect(questionHeader).toBeVisible();

      // Assert no advance ReferenceError surfaced
      const hasAdvanceError = consoleErrors.some(error =>
        error.includes("Cannot access 'advance' before initialization") ||
        error.includes('advance is not defined')
      );
      expect(hasAdvanceError).toBeFalsy();

      // Click first answer
      await page.waitForSelector('[data-testid="answer-option"]', { timeout: 5000 });
      const answerOptions = page.locator('[data-testid="answer-option"]');
      await answerOptions.first().click();

      // Ensure RewardPopup appears (accounting for the 400ms delay)
      const appearedSelector = await waitForRewardPopup(page);
      // Add more detailed error message if it fails
      if (!appearedSelector) {
        // Let's check what elements are actually visible
        const claimButton = page.locator('[data-testid="reward-claim-button"]');
        const claimButtonText = page.locator('text=Claim');
        const skipNowButton = page.locator('text=Skip Now');
        
        console.log('Claim button visible:', await claimButton.isVisible());
        console.log('Claim text visible:', await claimButtonText.isVisible());
        console.log('Skip now visible:', await skipNowButton.isVisible());
      }
      expect(appearedSelector).toBeTruthy();

      // Dismiss popup preferring "Skip Now" for consistency
      const skipNow = page.locator('text=Skip Now');
      if (await skipNow.isVisible()) {
        await skipNow.click();
      } else if (appearedSelector) {
        await page.click(appearedSelector);
      }

      // Verify progression to Question 2 (allow more time for ad simulation paths)
      await expect(page.locator('text=Question 2 of')).toBeVisible({ timeout: 8000 });

      // Final check: still no advance-related errors
      const finalAdvanceError = consoleErrors.some(error =>
        error.includes("Cannot access 'advance' before initialization") ||
        error.includes('advance is not defined')
      );
      expect(finalAdvanceError).toBeFalsy();
    });
  }
});