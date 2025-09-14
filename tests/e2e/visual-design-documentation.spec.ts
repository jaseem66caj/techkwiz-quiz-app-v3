import { test, expect } from '@playwright/test';

test.describe('TechKwiz Visual Design Documentation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up viewport for consistent screenshots
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('Homepage - Main Landing Page', async ({ page }) => {
    console.log('📸 Capturing Homepage');
    
    // Navigate to homepage
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    // Wait for quiz interface to load
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'test-results/design-doc/homepage.png', 
      fullPage: true 
    });
    
    console.log('✅ Homepage screenshot saved');
  });

  test('Start Page - Category Selection', async ({ page }) => {
    console.log('📸 Capturing Start Page');
    
    // Navigate to start page
    await page.goto('http://localhost:3002/start');
    await page.waitForLoadState('networkidle');
    
    // Wait for categories to load
    await page.waitForSelector('[data-testid="category-card"]', { timeout: 10000 });
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'test-results/design-doc/start-page.png', 
      fullPage: true 
    });
    
    console.log('✅ Start page screenshot saved');
  });

  test('Quiz Interface - Question Display', async ({ page }) => {
    console.log('📸 Capturing Quiz Interface');
    
    // Navigate to start page to select a category
    await page.goto('http://localhost:3002/start');
    await page.waitForLoadState('networkidle');
    
    // Wait for categories and click the first one
    await page.waitForSelector('[data-testid="category-card"]', { timeout: 10000 });
    const firstCategory = page.locator('[data-testid="category-card"]').first();
    await firstCategory.click();
    
    // Wait for quiz to load
    await page.waitForSelector('[data-testid="question-text"]', { timeout: 10000 });
    
    // Take screenshot of quiz interface
    await page.screenshot({ 
      path: 'test-results/design-doc/quiz-interface.png', 
      fullPage: true 
    });
    
    console.log('✅ Quiz interface screenshot saved');
  });

  test('Quiz Results Page', async ({ page }) => {
    console.log('📸 Capturing Quiz Results');
    
    // Navigate to start page to select a category
    await page.goto('http://localhost:3002/start');
    await page.waitForLoadState('networkidle');
    
    // Wait for categories and click the first one
    await page.waitForSelector('[data-testid="category-card"]', { timeout: 10000 });
    const firstCategory = page.locator('[data-testid="category-card"]').first();
    await firstCategory.click();
    
    // Answer all questions to reach results page
    for (let i = 0; i < 5; i++) {
      // Wait for question and answer options
      await page.waitForSelector('[data-testid="answer-option"]', { timeout: 5000 });
      
      // Click first answer option
      const answerOptions = page.locator('[data-testid="answer-option"]');
      await answerOptions.first().click();
      
      // Wait for next question or results
      await page.waitForTimeout(1000);
    }
    
    // Wait for results page
    await page.waitForSelector('text=Quiz Complete', { timeout: 10000 });
    
    // Take screenshot of results
    await page.screenshot({ 
      path: 'test-results/design-doc/quiz-results.png', 
      fullPage: true 
    });
    
    console.log('✅ Quiz results screenshot saved');
  });

  test('Profile Page', async ({ page }) => {
    console.log('📸 Capturing Profile Page');
    
    // Navigate to profile page
    await page.goto('http://localhost:3002/profile');
    await page.waitForLoadState('networkidle');
    
    // Wait for profile elements to load
    await page.waitForTimeout(2000);
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'test-results/design-doc/profile-page.png', 
      fullPage: true 
    });
    
    console.log('✅ Profile page screenshot saved');
  });

  test('Mobile View - Homepage', async ({ page }) => {
    console.log('📸 Capturing Mobile View - Homepage');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to homepage
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    // Wait for quiz interface to load
    await page.waitForSelector('[data-testid="quiz-interface"]', { timeout: 10000 });
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/design-doc/mobile-homepage.png', 
      fullPage: true 
    });
    
    console.log('✅ Mobile homepage screenshot saved');
  });

  test('Mobile View - Category Selection', async ({ page }) => {
    console.log('📸 Capturing Mobile View - Category Selection');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to start page
    await page.goto('http://localhost:3002/start');
    await page.waitForLoadState('networkidle');
    
    // Wait for categories to load
    await page.waitForSelector('[data-testid="category-card"]', { timeout: 10000 });
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/design-doc/mobile-start-page.png', 
      fullPage: true 
    });
    
    console.log('✅ Mobile start page screenshot saved');
  });

  test('Tablet View - Quiz Interface', async ({ page }) => {
    console.log('📸 Capturing Tablet View - Quiz Interface');
    
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Navigate to start page to select a category
    await page.goto('http://localhost:3002/start');
    await page.waitForLoadState('networkidle');
    
    // Wait for categories and click the first one
    await page.waitForSelector('[data-testid="category-card"]', { timeout: 10000 });
    const firstCategory = page.locator('[data-testid="category-card"]').first();
    await firstCategory.click();
    
    // Wait for quiz to load
    await page.waitForSelector('[data-testid="question-text"]', { timeout: 10000 });
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/design-doc/tablet-quiz-interface.png', 
      fullPage: true 
    });
    
    console.log('✅ Tablet quiz interface screenshot saved');
  });
});