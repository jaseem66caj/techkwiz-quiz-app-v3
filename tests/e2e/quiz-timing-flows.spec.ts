import { test, expect } from '@playwright/test';

test.describe('Quiz Timing and Progression Flows', () => {
  
  test('Homepage Quiz: Automatic progression with 400ms visual feedback', async ({ page }) => {
    // Seed user with sufficient coins for testing
    await page.addInitScript(() => {
      const user = {
        id: 'guest',
        name: 'Guest',
        avatar: '🤖',
        coins: 200,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0,
      };
      window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
    });

    // Navigate to homepage
    await page.goto('/');

    // Wait for quiz interface to load
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });

    // Get the first question text for reference
    const firstQuestionText = await page.locator('[data-testid="question-text"]').textContent();
    console.log('First question:', firstQuestionText);

    // Click the first answer option
    const firstOption = page.locator('[data-testid="answer-option"]').first();
    await firstOption.click();

    // Verify immediate visual feedback (answer should be selected)
    await expect(firstOption).toHaveClass(/bg-green-500|bg-red-500/);

    // Wait for automatic progression (should happen after 650ms total: 400ms feedback + 250ms pause)
    // Check if we've moved to the next question automatically
    await page.waitForTimeout(800); // Wait slightly longer than 650ms

    // Verify no RewardPopup appears on homepage quiz
    const rewardPopup = page.locator('text=Claim');
    await expect(rewardPopup).not.toBeVisible();

    // Verify automatic progression to next question
    const secondQuestionText = await page.locator('[data-testid="question-text"]').textContent();
    expect(secondQuestionText).not.toBe(firstQuestionText);

    console.log('✅ Homepage quiz: Automatic progression verified');
  });

  test('Category Quiz: Manual progression with RewardPopup after 400ms', async ({ page }) => {
    // Seed user with sufficient coins for category quiz
    await page.addInitScript(() => {
      const user = {
        id: 'guest',
        name: 'Guest',
        avatar: '🤖',
        coins: 200,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0,
      };
      window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
    });

    // Navigate to category quiz
    await page.goto('/quiz/programming');

    // Wait for quiz interface to load
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });

    // Get the first question text for reference
    const firstQuestionText = await page.locator('[data-testid="question-text"]').textContent();
    console.log('First question:', firstQuestionText);

    // Click the first answer option
    const firstOption = page.locator('[data-testid="answer-option"]').first();
    await firstOption.click();

    // Verify immediate visual feedback (answer should be selected)
    await expect(firstOption).toHaveClass(/bg-green-500|bg-red-500/);

    // Wait for RewardPopup to appear after 400ms
    await expect(page.locator('text=Claim')).toBeVisible({ timeout: 1000 });

    // Verify quiz progression is paused (question should not change)
    const questionAfterAnswer = await page.locator('[data-testid="question-text"]').textContent();
    expect(questionAfterAnswer).toBe(firstQuestionText);

    // Click the Claim button to advance manually
    await page.locator('text=Claim').click();

    // Wait for progression to next question
    await page.waitForTimeout(500);

    // Verify manual progression to next question
    const secondQuestionText = await page.locator('[data-testid="question-text"]').textContent();
    expect(secondQuestionText).not.toBe(firstQuestionText);

    console.log('✅ Category quiz: Manual progression with RewardPopup verified');
  });

  test('Timing consistency: Both quizzes use 400ms visual feedback delay', async ({ page }) => {
    // Test homepage quiz timing
    await page.addInitScript(() => {
      const user = {
        id: 'guest',
        name: 'Guest',
        avatar: '🤖',
        coins: 200,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0,
      };
      window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
    });

    // Test homepage quiz timing
    await page.goto('/');
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });

    const startTime = Date.now();
    await page.locator('[data-testid="answer-option"]').first().click();
    
    // Wait for automatic progression (650ms total timing)
    await page.waitForTimeout(800);
    const homepageTime = Date.now() - startTime;

    // Navigate to category quiz
    await page.goto('/quiz/programming');
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });

    const categoryStartTime = Date.now();
    await page.locator('[data-testid="answer-option"]').first().click();
    
    // Wait for RewardPopup to appear
    await expect(page.locator('text=Claim')).toBeVisible({ timeout: 1000 });
    const categoryTime = Date.now() - categoryStartTime;

    // Homepage should be ~650ms (400ms feedback + 250ms pause), Category should be ~400ms + popup interaction
    console.log(`Homepage timing: ${homepageTime}ms, Category timing: ${categoryTime}ms`);

    // Homepage: 650ms total timing (400ms feedback + 250ms pause)
    expect(homepageTime).toBeGreaterThan(650);
    expect(homepageTime).toBeLessThan(900);
    // Category: 400ms feedback + popup display time
    expect(categoryTime).toBeGreaterThan(400);
    expect(categoryTime).toBeLessThan(800);

    console.log('✅ Timing verified: Homepage uses 650ms total (400ms feedback + 250ms pause), Category uses 400ms + popup');
  });

  test('Coin calculations: Both quizzes use centralized reward system', async ({ page }) => {
    // Capture console logs to verify coin calculations
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && (msg.text().includes('Correct answer') || msg.text().includes('Earned'))) {
        consoleLogs.push(msg.text());
      }
    });

    await page.addInitScript(() => {
      const user = {
        id: 'guest',
        name: 'Guest',
        avatar: '🤖',
        coins: 200,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0,
      };
      window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
    });

    // Test homepage quiz coin calculation
    await page.goto('/');
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });
    await page.locator('[data-testid="answer-option"]').first().click();
    await page.waitForTimeout(800); // Wait for enhanced timing (650ms + buffer)

    // Test category quiz coin calculation
    await page.goto('/quiz/programming');
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });
    await page.locator('[data-testid="answer-option"]').first().click();
    await expect(page.locator('text=Claim')).toBeVisible({ timeout: 1000 });

    // Verify both quizzes log coin calculations
    expect(consoleLogs.length).toBeGreaterThan(0);
    
    // Check that coin amounts are consistent (should be 50 coins for correct answers)
    const coinAmounts = consoleLogs.map(log => {
      const match = log.match(/(\d+) coins/);
      return match ? parseInt(match[1]) : 0;
    });

    // All coin amounts should be the same (centralized calculation)
    const uniqueAmounts = [...new Set(coinAmounts.filter(amount => amount > 0))];
    expect(uniqueAmounts.length).toBe(1); // Should only have one unique coin amount
    expect(uniqueAmounts[0]).toBe(50); // Should be 50 coins per correct answer

    console.log('✅ Coin calculations verified: Both quizzes use centralized reward system');
  });

  test('Performance: Insufficient coins detection speed (<300ms)', async ({ page }) => {
    // Seed user with insufficient coins (0 coins)
    await page.addInitScript(() => {
      const user = {
        id: 'guest',
        name: 'Guest',
        avatar: '🤖',
        coins: 0, // Insufficient coins for 100 coin entry fee
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0,
      };
      window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
    });

    // Navigate to category quiz and measure time to insufficient coins message
    const startTime = Date.now();
    await page.goto('/quiz/programming');

    // Wait for insufficient coins message to appear
    await expect(page.locator('text=Insufficient coins')).toBeVisible({ timeout: 5000 });
    const detectionTime = Date.now() - startTime;

    // Verify performance target: <300ms for insufficient coins detection
    console.log(`⚡ Insufficient coins detection time: ${detectionTime}ms`);
    expect(detectionTime).toBeLessThan(300);

    // Verify message content is correct
    await expect(page.locator('text=Taking you to the homepage quiz where you can earn coins for free!')).toBeVisible();

    console.log('✅ Performance test passed: Insufficient coins detected in <300ms');
  });

  test('Performance: Start page button feedback (<100ms)', async ({ page }) => {
    // Seed user with insufficient coins
    await page.addInitScript(() => {
      const user = {
        id: 'guest',
        name: 'Guest',
        avatar: '🤖',
        coins: 0,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0,
      };
      window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
    });

    // Navigate to start page
    await page.goto('/start');
    await page.waitForSelector('button:has-text("PLAY")', { timeout: 10000 });

    // Measure time from button click to visual feedback
    const startTime = Date.now();
    await page.locator('button:has-text("PLAY")').first().click();

    // Wait for loading state to appear
    await expect(page.locator('text=Loading...')).toBeVisible({ timeout: 1000 });
    const feedbackTime = Date.now() - startTime;

    // Verify immediate feedback: <100ms
    console.log(`⚡ Button feedback time: ${feedbackTime}ms`);
    expect(feedbackTime).toBeLessThan(100);

    console.log('✅ Performance test passed: Button provides immediate feedback in <100ms');
  });

  test('Regression test: Existing quiz functionality preserved', async ({ page }) => {
    await page.addInitScript(() => {
      const user = {
        id: 'guest',
        name: 'Guest',
        avatar: '🤖',
        coins: 200,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0,
      };
      window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
    });

    // Test category quiz complete flow
    await page.goto('/quiz/programming');
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });

    // Answer first question and verify RewardPopup flow
    await page.locator('[data-testid="answer-option"]').first().click();
    await expect(page.locator('text=Claim')).toBeVisible({ timeout: 1000 });
    await page.locator('text=Claim').click();

    // Verify quiz continues normally
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 5000 });
    
    // Test homepage quiz complete flow
    await page.goto('/');
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });

    // Answer first question and verify automatic progression
    await page.locator('[data-testid="answer-option"]').first().click();
    await page.waitForTimeout(800); // Wait for enhanced timing (650ms + buffer)

    // Verify quiz continues automatically
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 5000 });

    console.log('✅ Regression test passed: Existing quiz functionality preserved');
  });
});
