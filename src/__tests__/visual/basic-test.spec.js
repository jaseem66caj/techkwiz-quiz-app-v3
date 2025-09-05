// @ts-check
const { test, expect } = require('@playwright/test');

test('Basic homepage test', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/TechKwiz/);
});