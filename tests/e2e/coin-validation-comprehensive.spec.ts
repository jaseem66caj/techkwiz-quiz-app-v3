import { test, expect } from '@playwright/test';

test.describe('Comprehensive Coin Validation Tests', () => {
  
  test('Scenario A: User with 200 coins should enter programming quiz without redirection', async ({ page }) => {
    // Seed user with 200 coins (well above entry fee of 100)
    await page.addInitScript((coins: number) => {
      const user = {
        id: 'test-user-200',
        name: 'Rich Tester',
        avatar: '💰',
        coins,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0,
      };
      window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
    }, 200);

    // Navigate directly to programming category
    await page.goto('http://localhost:3002/quiz/programming');

    // Wait for quiz interface to load (should NOT redirect)
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });

    // Verify we're still on the quiz page (not redirected to homepage)
    expect(page.url()).toContain('/quiz/programming');

    // Verify quiz content is loaded (answer options should be present)
    await page.waitForSelector('[data-testid="answer-option"]', { timeout: 5000 });
    const answerOptions = page.locator('[data-testid="answer-option"]');
    await expect(answerOptions.first()).toBeVisible();

    // Verify no insufficient coins message appears
    const insufficientCoinsMessage = page.locator('text=Insufficient coins');
    await expect(insufficientCoinsMessage).not.toBeVisible();

    console.log('✅ Scenario A passed: User with 200 coins entered quiz successfully');
  });

  test('Scenario B: User with 50 coins should see countdown redirection to homepage', async ({ page }) => {
    // Seed user with 50 coins (below entry fee of 100) using same format as working test
    await page.addInitScript((coins: number) => {
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
      window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
    }, 50);

    // Navigate directly to programming category
    await page.goto('http://localhost:3000/quiz/programming');

    // Should see insufficient coins message
    await expect(page.locator('text=Insufficient coins')).toBeVisible({ timeout: 8000 });

    // Should see guidance text about earning coins
    await expect(page.locator('text=Taking you to the homepage quiz where you can earn coins for free!')).toBeVisible();

    // Should see countdown
    const countdownElement = page.locator('text=Redirecting to homepage quiz in');
    await expect(countdownElement).toBeVisible();

    // Use manual button as fallback (same as working test)
    const goNow = page.locator('text=Go to Homepage Quiz Now');
    if (await goNow.isVisible()) {
      await goNow.click();
    }

    // Wait for navigation to homepage
    await page.waitForURL('http://localhost:3000/**', { timeout: 10000 });

    // Verify we're on the homepage by checking for homepage content
    await expect(page.locator('h1:has-text("Welcome to TechKwiz!")')).toBeVisible({ timeout: 10000 });

    console.log('✅ Scenario B passed: User with 50 coins was redirected to homepage');
  });

  test('Scenario C: Start page navigation should use unified flow', async ({ page }) => {
    // Seed user with 75 coins (below entry fee)
    await page.addInitScript((coins: number) => {
      const user = {
        id: 'test-user-75',
        name: 'Start Page Tester',
        avatar: '🎮',
        coins,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0,
      };
      window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
    }, 75);

    // Navigate to start page
    await page.goto('http://localhost:3000/start');

    // Wait for categories to load
    await page.waitForSelector('text=Programming', { timeout: 10000 });

    // Click on Programming category's PLAY button
    await page.waitForSelector('text=Programming', { timeout: 10000 });
    const playButton = page.locator('button:has-text("PLAY")').first();
    await playButton.click();

    // Should navigate to category page and then show insufficient coins redirection
    await expect(page.locator('text=Insufficient coins')).toBeVisible({ timeout: 8000 });
    
    // Should NOT see legacy error message
    const legacyError = page.locator('text=You need 100 coins to play this category');
    await expect(legacyError).not.toBeVisible();

    // Should see the new redirection flow
    await expect(page.locator('text=Taking you to the homepage quiz where you can earn coins for free!')).toBeVisible();

    console.log('✅ Scenario C passed: Start page uses unified insufficient coins flow');
  });

  test('Scenario D: Edge case - User with exactly 100 coins should enter quiz', async ({ page }) => {
    // Seed user with exactly 100 coins (equal to entry fee)
    await page.addInitScript((coins: number) => {
      const user = {
        id: 'test-user-100',
        name: 'Edge Case Tester',
        avatar: '⚖️',
        coins,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0,
      };
      window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
    }, 100);

    // Navigate directly to programming category
    await page.goto('http://localhost:3000/quiz/programming');

    // Wait for quiz interface to load (should NOT redirect)
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });

    // Verify we're still on the quiz page
    expect(page.url()).toContain('/quiz/programming');

    // Verify quiz content is loaded
    await page.waitForSelector('[data-testid="answer-option"]', { timeout: 5000 });
    
    // Verify no insufficient coins message appears
    const insufficientCoinsMessage = page.locator('text=Insufficient coins');
    await expect(insufficientCoinsMessage).not.toBeVisible();

    console.log('✅ Scenario D passed: User with exactly 100 coins entered quiz successfully');
  });

  test('Debug: Console logs validation for 50 coin user', async ({ page }) => {
    // Capture console logs to debug the insufficient coins issue
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('Coin Validation Debug')) {
        consoleLogs.push(msg.text());
      }
    });

    // Seed user with 50 coins (should trigger insufficient coins)
    await page.addInitScript((coins: number) => {
      const user = {
        id: 'debug-user-50',
        name: 'Debug Tester 50',
        avatar: '🔍',
        coins,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0,
      };
      window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
    }, 50);

    // Navigate to programming category
    await page.goto('http://localhost:3000/quiz/programming');

    // Wait a moment for logs to be captured
    await page.waitForTimeout(3000);

    // Check if we got redirected (should show insufficient coins)
    const currentUrl = page.url();
    const hasInsufficientCoinsMessage = await page.locator('text=Insufficient coins').isVisible();

    console.log('🔍 Debug Results for 50 coins:', {
      finalUrl: currentUrl,
      hasInsufficientCoinsMessage,
      consoleLogs
    });

    // Log the debug information for analysis
    if (consoleLogs.length > 0) {
      console.log('📋 Coin Validation Debug Logs:');
      consoleLogs.forEach(log => console.log(log));
    }

    // This test is for debugging - we'll check the results manually
    expect(consoleLogs.length).toBeGreaterThan(0);
  });

  test('Debug: Console logs validation for 150 coin user', async ({ page }) => {
    // Capture console logs to debug the false positive issue
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('Coin Validation Debug')) {
        consoleLogs.push(msg.text());
      }
    });

    // Seed user with 150 coins (should be sufficient)
    await page.addInitScript((coins: number) => {
      const user = {
        id: 'debug-user-150',
        name: 'Debug Tester',
        avatar: '🔍',
        coins,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0,
      };
      window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
    }, 150);

    // Navigate to programming category
    await page.goto('http://localhost:3000/quiz/programming');

    // Wait a moment for logs to be captured
    await page.waitForTimeout(3000);

    // Check if we got redirected (false positive case)
    const currentUrl = page.url();
    const hasInsufficientCoinsMessage = await page.locator('text=Insufficient coins').isVisible();

    console.log('🔍 Debug Results:', {
      finalUrl: currentUrl,
      hasInsufficientCoinsMessage,
      consoleLogs
    });

    // Log the debug information for analysis
    if (consoleLogs.length > 0) {
      console.log('📋 Coin Validation Debug Logs:');
      consoleLogs.forEach(log => console.log(log));
    }

    // This test is for debugging - we'll check the results manually
    expect(consoleLogs.length).toBeGreaterThan(0);
  });
});
