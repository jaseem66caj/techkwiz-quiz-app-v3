import { test, expect } from '@playwright/test';

const categories = ['technology', 'science', 'mathematics'];

async function waitForRewardPopup(page) {
  // Check for any of the expected popup buttons within ~800ms
  const selectors = [
    'text=Skip Now',
    'text=Continue',
    'text=Claim',
    'text=Watch Again'
  ];
  const timeout = 800;
  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { timeout });
      return sel;
    } catch {}
  }
  return null;
}

test.describe('Category Quiz – Fresh Load RewardPopup & Progression', () => {
  for (const category of categories) {
    test(`Fresh load: ${category} shows reward popup fast and progresses`, async ({ page }) => {
      // Fresh visit (not a reload)
      await page.goto(`http://localhost:3000/quiz/${category}`);

      // Observe console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Wait for interface to be ready
      await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });
      await page.waitForSelector('[data-testid="question-text"]', { timeout: 5000 });

      // Verify header shows Question 1
      const questionHeader = page.locator('h1:has-text("Question 1 of")');
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

      // Ensure RewardPopup appears quickly (<= ~800ms)
      const appearedSelector = await waitForRewardPopup(page);
      expect(appearedSelector, 'RewardPopup did not appear quickly on first answer').not.toBeNull();

      // Dismiss popup preferring "Skip Now" for consistency
      const skipNow = page.locator('text=Skip Now');
      if (await skipNow.isVisible()) {
        await skipNow.click();
      } else if (appearedSelector) {
        await page.click(appearedSelector);
      }

      // Verify progression to Question 2 (allow more time for ad simulation paths)
      await expect(page.locator('h1:has-text("Question 2 of")')).toBeVisible({ timeout: 8000 });

      // Final check: still no advance-related errors
      const finalAdvanceError = consoleErrors.some(error =>
        error.includes("Cannot access 'advance' before initialization") ||
        error.includes('advance is not defined')
      );
      expect(finalAdvanceError).toBeFalsy();
    });
  }
});

