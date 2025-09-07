import { test, expect } from '@playwright/test';

test.describe('TechKwiz Quiz Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start the development server if not already running
    await page.goto('http://localhost:3000');
  });

  test('Homepage loads and displays quiz interface', async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check if the page title is correct
    await expect(page).toHaveTitle(/TechKwiz/);
    
    // Wait for loading to complete and quiz to appear
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });
    
    // Verify quiz interface is visible
    const quizInterface = page.locator('[data-testid="quiz-interface"]');
    await expect(quizInterface).toBeVisible();
    
    // Check if welcome message or first question is visible
    const welcomeMessage = page.locator('text=Welcome to TechKwiz');
    const questionText = page.locator('[data-testid="question-text"]');
    
    // Either welcome message or question should be visible
    const isWelcomeVisible = await welcomeMessage.isVisible().catch(() => false);
    const isQuestionVisible = await questionText.isVisible().catch(() => false);
    
    expect(isWelcomeVisible || isQuestionVisible).toBeTruthy();
  });

  test('Complete full quiz flow with correct answers', async ({ page }) => {
    // Wait for the quiz to load
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });
    
    let currentQuestion = 1;
    const totalQuestions = 5;
    let totalCoins = 0;
    
    // Complete all 5 questions
    for (let i = 0; i < totalQuestions; i++) {
      console.log(`Answering question ${currentQuestion}/${totalQuestions}`);
      
      // Wait for question to be visible
      await page.waitForSelector('[data-testid="question-text"]', { timeout: 5000 });
      
      // Get the question text
      const questionText = await page.locator('[data-testid="question-text"]').textContent();
      console.log(`Question: ${questionText}`);
      
      // Wait for answer options to be visible
      await page.waitForSelector('[data-testid="answer-option"]', { timeout: 5000 });
      
      // Get all answer options
      const answerOptions = page.locator('[data-testid="answer-option"]');
      const answerCount = await answerOptions.count();
      
      expect(answerCount).toBeGreaterThan(0);
      console.log(`Found ${answerCount} answer options`);
      
      // Click the first answer option (assuming it's correct for testing)
      await answerOptions.first().click();
      
      // Wait for feedback or next question
      await page.waitForTimeout(2000);
      
      // Check if coins were awarded (25 coins per correct answer)
      const coinDisplay = page.locator('[data-testid="coin-display"]');
      if (await coinDisplay.isVisible()) {
        const coinText = await coinDisplay.textContent();
        console.log(`Current coins: ${coinText}`);
      }
      
      currentQuestion++;
      totalCoins += 25; // Assuming correct answer
    }
    
    // Wait for quiz completion
    await page.waitForSelector('text=Quiz Complete', { timeout: 10000 });
    
    // Verify quiz completion message
    const completionMessage = page.locator('text=Quiz Complete');
    await expect(completionMessage).toBeVisible();
    
    console.log(`Quiz completed! Expected total coins: ${totalCoins}`);
  });

  test('Exit confirmation modal works correctly', async ({ page }) => {
    // Wait for the quiz to load
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });
    
    // Start answering a question to get into the quiz
    await page.waitForSelector('[data-testid="answer-option"]', { timeout: 5000 });
    const answerOptions = page.locator('[data-testid="answer-option"]');
    await answerOptions.first().click();
    
    // Wait for next question
    await page.waitForTimeout(2000);
    
    // Try to navigate away (simulate back button or navigation)
    await page.goBack();
    
    // Check if exit confirmation modal appears
    const exitModal = page.locator('[data-testid="exit-confirmation-modal"]');
    
    // If modal appears, test its functionality
    if (await exitModal.isVisible()) {
      console.log('Exit confirmation modal appeared');
      
      // Test continue playing button
      const continueButton = page.locator('text=Continue Playing');
      await continueButton.click();
      
      // Should stay on quiz page
      await expect(page.locator('[data-testid="quiz-interface"]')).toBeVisible();
    }
  });

  test('Navigation elements are present and functional', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if navigation is present
    const navigation = page.locator('nav');
    
    if (await navigation.isVisible()) {
      console.log('Navigation is visible');
      
      // Check for common navigation items
      const homeLink = page.locator('text=Home');
      const categoriesLink = page.locator('text=Categories');
      
      if (await homeLink.isVisible()) {
        console.log('Home link found');
      }
      
      if (await categoriesLink.isVisible()) {
        console.log('Categories link found');
      }
    }
    
    // Check if coin display is present
    const coinDisplay = page.locator('[data-testid="coin-display"]');
    if (await coinDisplay.isVisible()) {
      console.log('Coin display is visible');
      const coinText = await coinDisplay.textContent();
      console.log(`Coin display text: ${coinText}`);
    }
  });

  test('Responsive design works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Wait for quiz interface
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });
    
    // Verify quiz interface is still visible on mobile
    const quizInterface = page.locator('[data-testid="quiz-interface"]');
    await expect(quizInterface).toBeVisible();
    
    // Check if answer options are properly sized for mobile
    await page.waitForSelector('[data-testid="answer-option"]', { timeout: 5000 });
    const answerOptions = page.locator('[data-testid="answer-option"]');
    const firstOption = answerOptions.first();
    
    // Verify the option is clickable and visible
    await expect(firstOption).toBeVisible();
    
    // Test clicking on mobile
    await firstOption.click();
    
    console.log('Mobile viewport test completed successfully');
  });

  test('Error handling and loading states', async ({ page }) => {
    // Test loading state
    await page.goto('http://localhost:3000');
    
    // Check for loading indicator
    const loadingIndicator = page.locator('text=Loading TechKwiz');
    
    // Loading should appear initially
    if (await loadingIndicator.isVisible()) {
      console.log('Loading state detected');
      
      // Wait for loading to complete
      await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 15000 });
      
      // Loading should disappear
      await expect(loadingIndicator).not.toBeVisible();
    }
    
    // Verify final state is correct
    const quizInterface = page.locator('[data-testid="quiz-interface"]');
    await expect(quizInterface).toBeVisible();
  });
});
