// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Visual Regression Tests', () => {
  test('Homepage - Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for animations
    await expect(page).toHaveScreenshot('homepage-mobile.png', { 
      maxDiffPixelRatio: 0.01 
    });
  });

  test('Start Page - Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/start');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('start-page-mobile.png', { 
      maxDiffPixelRatio: 0.01 
    });
  });

  test('Quiz Page - Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/quiz/swipe-personality');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('quiz-page-mobile.png', { 
      maxDiffPixelRatio: 0.01 
    });
  });

  test('Profile Page - Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/profile');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('profile-page-mobile.png', { 
      maxDiffPixelRatio: 0.01 
    });
  });

  test('Homepage - Tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('homepage-tablet.png', { 
      maxDiffPixelRatio: 0.01 
    });
  });

  test('Homepage - Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('homepage-desktop.png', { 
      maxDiffPixelRatio: 0.01 
    });
  });
});