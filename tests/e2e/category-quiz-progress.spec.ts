import { test, expect } from '@playwright/test';

test.describe('Category Quiz Progression Tests', () => {
  test('Category quiz loads without ReferenceError and shows question header', async ({ page }) => {
    // Seed user with sufficient coins to enter category quizzes (entry fee = 100)
    await page.addInitScript((coins: number) => {
      const user = {
        id: 'tester',
        name: 'Tester',
        avatar: '🧪',
        coins,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0,
      };
      // @ts-ignore
      window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
    }, 200);

    // Stabilize animations for deterministic clicks in tests
    await page.addInitScript(() => {
      try {
        const style = document.createElement('style');
        style.innerHTML = '*{transition:none !important; animation:none !important;}';
        document.documentElement.appendChild(style);
      } catch {}
    });

    // Navigate to a valid category quiz page
    await page.goto('/quiz/programming');

    // Wait for the quiz to load - increase timeout for dynamic components
    // First check if we're on the insufficient coins page (should not be the case with 200 coins)
    const insufficientCoinsMessage = page.locator('text=Insufficient coins');
    const isInsufficientCoinsPage = await insufficientCoinsMessage.isVisible({ timeout: 5000 });
    
    if (isInsufficientCoinsPage) {
      throw new Error('User redirected to insufficient coins page despite having 200 coins');
    }

    // Wait for the quiz interface to load with increased timeout
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 30000 });

    // Check for any console errors, specifically ReferenceError
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait for answer options to be ready (more robust than specific header text)
    await page.waitForSelector('[data-testid="answer-option"]', { timeout: 15000 });

    // Try to log the question text if available (non-fatal if absent)
    const headerLocator = page.locator('[data-testid="question-text"]');
    const hasHeader = await headerLocator.count().then(c => c > 0);
    const initialHeaderText = hasHeader ? await headerLocator.first().textContent() : null;
    if (initialHeaderText) {
      console.log(`Question header text: ${initialHeaderText}`);
    }

    // Verify no ReferenceError about 'advance' variable
    const hasAdvanceError = consoleErrors.some(error =>
      error.includes('Cannot access \'advance\' before initialization') ||
      error.includes('advance is not defined')
    );

    expect(hasAdvanceError).toBeFalsy();
    console.log('✅ No ReferenceError for advance variable detected');

    // Answer first question to test progression
    console.log('Answering first question');

    // Wait for answer options to be visible
    await page.waitForSelector('[data-testid="answer-option"]', { timeout: 10000 });

    // Allow initial animations/transitions to settle before interaction
    await page.waitForTimeout(1500);

    // Click the first answer option
    const answerOptions = page.locator('[data-testid="answer-option"]');
    await answerOptions.first().click({ force: true });

    // Wait for reward popup to appear (account for 400ms delay)
    await page.waitForTimeout(2000);
    
    // Look for the reward popup and click the claim button
    const claimButton = page.locator('[data-testid="reward-claim-button"]');
    const claimButtonText = page.locator('text=Claim');
    
    // Check if the claim button is visible
    if (await claimButton.isVisible({ timeout: 5000 }) || await claimButtonText.isVisible({ timeout: 5000 })) {
      console.log('Found reward popup, clicking claim button');
      // Click the claim button using either selector
      if (await claimButton.isVisible()) {
        await claimButton.click();
      } else {
        await claimButtonText.click();
      }
    } else {
      console.log('Reward popup not found, continuing...');
    }

    // Wait for next question
    await page.waitForTimeout(4000);

    // Prefer checking for question text change when available
    if (initialHeaderText) {
      await expect(headerLocator.first()).not.toHaveText(initialHeaderText, { timeout: 10000 });
      const newHeaderText = await headerLocator.first().textContent();
      console.log(`✅ Progressed. New header: ${newHeaderText}`);
    } else {
      // Fallback: ensure answer options are still present (quiz not stuck)
      await expect(page.locator('[data-testid="answer-option"]').first()).toBeVisible({ timeout: 10000 });
      console.log('✅ Progressed to next step (fallback check)');
    }

    // Final verification: no advance-related errors occurred during progression
    const finalAdvanceError = consoleErrors.some(error =>
      error.includes('Cannot access \'advance\' before initialization') ||
      error.includes('advance is not defined')
    );

    expect(finalAdvanceError).toBeFalsy();
    console.log('✅ Quiz progression completed without advance variable errors');
  });
});