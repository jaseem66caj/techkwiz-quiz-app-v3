// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('TechKwiz End-to-End User Journey', () => {
  test('Complete user experience from homepage to quiz completion', async ({ page }) => {
    // Set viewport for mobile testing
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 1. Visit homepage
    await page.goto('/');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('01-homepage.png', { 
      maxDiffPixelRatio: 0.01 
    });
    
    // 2. Click start button to go to start page
    await page.getByText('Start Quiz').click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('02-start-page.png', { 
      maxDiffPixelRatio: 0.01 
    });
    
    // 3. Select a quiz category (using the first available)
    await page.locator('.category-card').first().click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('03-quiz-page.png', { 
      maxDiffPixelRatio: 0.01 
    });
    
    // 4. Answer first question (select first option)
    await page.locator('.quiz-option').first().click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('04-question-answered.png', { 
      maxDiffPixelRatio: 0.01 
    });
    
    // 5. Continue through remaining questions
    for (let i = 0; i < 4; i++) {
      // Wait for next question
      await page.waitForTimeout(2000);
      // Select first option for each question
      await page.locator('.quiz-option').first().click();
      await page.waitForTimeout(2000);
      
      if (i < 3) {
        await expect(page).toHaveScreenshot(`05-question-${i+2}-answered.png`, { 
          maxDiffPixelRatio: 0.01 
        });
      }
    }
    
    // 6. Quiz completion screen
    await page.waitForTimeout(3000);
    await expect(page).toHaveScreenshot('06-quiz-completion.png', { 
      maxDiffPixelRatio: 0.01 
    });
    
    // 7. Navigate to profile page
    await page.goto('/profile');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('07-profile-page.png', { 
      maxDiffPixelRatio: 0.01 
    });
    
    // 8. Check leaderboard
    await page.goto('/leaderboard');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('08-leaderboard.png', { 
      maxDiffPixelRatio: 0.01 
    });
  });

  test('User journey on tablet', async ({ page }) => {
    // Set viewport for tablet testing
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Homepage
    await page.goto('/');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('tablet-01-homepage.png', { 
      maxDiffPixelRatio: 0.01 
    });
    
    // Start page
    await page.getByText('Start Quiz').click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('tablet-02-start-page.png', { 
      maxDiffPixelRatio: 0.01 
    });
  });

  test('User journey on desktop', async ({ page }) => {
    // Set viewport for desktop testing
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Homepage
    await page.goto('/');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('desktop-01-homepage.png', { 
      maxDiffPixelRatio: 0.01 
    });
    
    // Start page
    await page.getByText('Start Quiz').click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('desktop-02-start-page.png', { 
      maxDiffPixelRatio: 0.01 
    });
  });
});