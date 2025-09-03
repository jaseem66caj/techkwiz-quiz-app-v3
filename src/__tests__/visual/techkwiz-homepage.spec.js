// @ts-check
const { test, expect } = require('@playwright/test');

test('TechKwiz Homepage Test', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000); // Wait for animations
  
  // Check that the page has loaded
  await expect(page).toHaveTitle(/TechKwiz/);
  
  // Take a screenshot for visual comparison
  await expect(page).toHaveScreenshot('techkwiz-homepage.png', { 
    maxDiffPixelRatio: 0.01 
  });
});