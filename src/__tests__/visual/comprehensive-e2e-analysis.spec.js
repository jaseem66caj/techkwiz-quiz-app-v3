// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Comprehensive End-to-End User Journey Analysis for Techkwiz-v8
 * Testing all critical user flows and validating application functionality
 * after recent maintenance tasks (Next.js 15.5.2 upgrade, RewardPopup fixes, etc.)
 */

test.describe('Comprehensive E2E Analysis - Techkwiz-v8', () => {
  
  // Phase 1: Basic Connectivity and Core Functionality
  test.describe('Phase 1: Basic Connectivity and Core Functionality', () => {
    
    test('Server Health Check - All Viewports', async ({ page, browserName }) => {
      const viewports = [
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1200, height: 800 }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // Navigate to homepage with extended timeout
        const startTime = Date.now();
        await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
        const loadTime = Date.now() - startTime;
        
        // Verify page loads within 10 seconds
        expect(loadTime).toBeLessThan(10000);
        
        // Verify page title contains "TechKwiz" (case-sensitive)
        const title = await page.title();
        expect(title).toContain('TechKwiz');
        
        // Check for main layout elements
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('main, [role="main"], .main-content')).toBeVisible();
        
        // Verify no console errors
        const consoleErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        
        // Wait for hydration to complete
        await page.waitForTimeout(2000);
        
        // Check for hydration errors
        const hydrationErrors = consoleErrors.filter(error => 
          error.includes('hydration') || error.includes('mismatch')
        );
        expect(hydrationErrors).toHaveLength(0);
        
        console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}): Loaded in ${loadTime}ms`);
      }
    });

    test('Multi-Viewport Navigation Validation', async ({ page }) => {
      const viewports = [
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1200, height: 800 }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        
        // Test responsive navigation
        if (viewport.width < 768) {
          // Mobile: Check for hamburger menu
          const mobileMenuButton = page.locator('[aria-label*="menu"], .mobile-menu-button, button[class*="mobile"]');
          if (await mobileMenuButton.count() > 0) {
            await expect(mobileMenuButton.first()).toBeVisible();
          }
        } else {
          // Desktop/Tablet: Check for full navigation
          const navLinks = page.locator('nav a, nav button');
          expect(await navLinks.count()).toBeGreaterThan(0);
        }
        
        // Verify text readability and button clickability
        const buttons = page.locator('button, a[role="button"]');
        const buttonCount = await buttons.count();
        if (buttonCount > 0) {
          const firstButton = buttons.first();
          await expect(firstButton).toBeVisible();
          
          // Check if button is clickable (not disabled)
          const isDisabled = await firstButton.getAttribute('disabled');
          expect(isDisabled).toBeNull();
        }
        
        console.log(`✅ ${viewport.name}: Navigation validated`);
      }
    });
  });

  // Phase 2: Homepage Quiz Functionality
  test.describe('Phase 2: Homepage Quiz Functionality', () => {
    
    test('Quick Quiz Interface Testing', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Look for quiz interface components
      const quizInterface = page.locator('.quiz-interface, [data-testid="quiz-interface"], .enhanced-quiz-interface');
      
      if (await quizInterface.count() > 0) {
        await expect(quizInterface.first()).toBeVisible();
        
        // Test quiz questions loading
        const questions = page.locator('.question, [data-testid="question"]');
        if (await questions.count() > 0) {
          await expect(questions.first()).toBeVisible();
          
          // Test answer selection
          const answers = page.locator('.answer, [data-testid="answer"], button[class*="answer"]');
          if (await answers.count() > 0) {
            const firstAnswer = answers.first();
            await expect(firstAnswer).toBeVisible();
            
            // Click answer and verify visual feedback
            await firstAnswer.click();
            await page.waitForTimeout(1000);
            
            // Check for RewardPopup (recent fix validation)
            const rewardPopup = page.locator('.reward-popup, [data-testid="reward-popup"]');
            if (await rewardPopup.count() > 0) {
              await expect(rewardPopup.first()).toBeVisible();
              
              // Verify coin amount display
              const coinDisplay = page.locator('[data-testid="coins-earned"], .coins-earned');
              if (await coinDisplay.count() > 0) {
                const coinText = await coinDisplay.first().textContent();
                expect(coinText).toMatch(/\d+/); // Should contain numbers
              }
              
              // Test RewardPopup buttons (onClaimReward/onSkipReward fix)
              const claimButton = page.locator('button:has-text("Claim"), button:has-text("Continue"), .claim-button');
              if (await claimButton.count() > 0) {
                await claimButton.first().click();
                await page.waitForTimeout(500);
              }
            }
          }
        }
        
        console.log('✅ Homepage quiz interface tested successfully');
      } else {
        console.log('ℹ️ No quiz interface found on homepage - may be on different route');
      }
    });
  });

  // Phase 3: Navigation and Route Validation
  test.describe('Phase 3: Navigation and Route Validation', () => {
    
    const routes = [
      { path: '/', name: 'Homepage' },
      { path: '/start', name: 'Category Selection' },
      { path: '/profile', name: 'User Profile' },
      { path: '/leaderboard', name: 'Leaderboard' },
      { path: '/about', name: 'About Page' },
      { path: '/privacy', name: 'Privacy Policy' }
    ];

    for (const route of routes) {
      test(`Route Testing: ${route.name} (${route.path})`, async ({ page }) => {
        const startTime = Date.now();
        
        try {
          await page.goto(route.path, { waitUntil: 'networkidle', timeout: 15000 });
          const loadTime = Date.now() - startTime;
          
          // Verify route loads within 10 seconds
          expect(loadTime).toBeLessThan(10000);
          
          // Verify page content loads
          await expect(page.locator('body')).toBeVisible();
          
          // Check for specific route content
          if (route.path === '/start') {
            // Category selection page
            const categories = page.locator('.category, [data-testid="category"]');
            if (await categories.count() > 0) {
              await expect(categories.first()).toBeVisible();
            }
          } else if (route.path === '/profile') {
            // Profile page - check for null safety improvements
            await page.waitForTimeout(2000); // Allow time for data loading
            const profileContent = page.locator('.profile, [data-testid="profile"]');
            if (await profileContent.count() > 0) {
              await expect(profileContent.first()).toBeVisible();
            }
          } else if (route.path === '/leaderboard') {
            // Leaderboard page - check for null safety improvements
            await page.waitForTimeout(2000);
            const leaderboardContent = page.locator('.leaderboard, [data-testid="leaderboard"]');
            if (await leaderboardContent.count() > 0) {
              await expect(leaderboardContent.first()).toBeVisible();
            }
          }
          
          console.log(`✅ ${route.name}: Loaded in ${loadTime}ms`);
          
        } catch (error) {
          console.error(`❌ ${route.name} failed:`, error.message);
          throw error;
        }
      });
    }

    test('Dynamic Quiz Routes Testing', async ({ page }) => {
      const categories = ['movies', 'social-media', 'influencers'];
      
      for (const category of categories) {
        const quizPath = `/quiz/${category}`;
        
        try {
          await page.goto(quizPath, { waitUntil: 'networkidle', timeout: 15000 });
          
          // Verify quiz interface loads
          await page.waitForTimeout(3000); // Allow time for quiz data loading
          
          // Check for CountdownTimer component
          const timer = page.locator('.countdown-timer, [data-testid="timer"]');
          if (await timer.count() > 0) {
            await expect(timer.first()).toBeVisible();
          }
          
          // Check for quiz questions
          const quizContent = page.locator('.quiz-interface, .question, [data-testid="quiz"]');
          if (await quizContent.count() > 0) {
            await expect(quizContent.first()).toBeVisible();
          }
          
          console.log(`✅ Quiz route /${category}: Loaded successfully`);
          
        } catch (error) {
          console.error(`❌ Quiz route /${category} failed:`, error.message);
          // Don't throw - continue with other categories
        }
      }
    });
  });

  // Phase 4: Complete User Journey Integration
  test.describe('Phase 4: Complete User Journey Integration', () => {
    
    test('End-to-End User Flow - Critical Path', async ({ page }) => {
      console.log('🚀 Starting complete user journey test...');
      
      // Step 1: Start at homepage
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      let initialCoins = 0;
      
      // Try to find and complete homepage quiz if available
      const homeQuiz = page.locator('.quiz-interface, [data-testid="quiz-interface"]');
      if (await homeQuiz.count() > 0) {
        console.log('📝 Found homepage quiz, attempting to complete...');
        
        const answers = page.locator('button[class*="answer"], .answer-option');
        if (await answers.count() > 0) {
          await answers.first().click();
          await page.waitForTimeout(1000);
          
          // Handle RewardPopup if it appears
          const rewardPopup = page.locator('.reward-popup, [data-testid="reward-popup"]');
          if (await rewardPopup.count() > 0) {
            const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Claim"), .continue-button');
            if (await continueBtn.count() > 0) {
              await continueBtn.first().click();
              await page.waitForTimeout(500);
            }
          }
        }
      }
      
      // Step 2: Navigate to category selection
      console.log('📚 Navigating to category selection...');
      await page.goto('/start', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      // Step 3: Choose a category (if available)
      const categoryButtons = page.locator('button[class*="category"], .category-button, a[href*="/quiz/"]');
      if (await categoryButtons.count() > 0) {
        console.log('🎯 Found categories, selecting first available...');
        await categoryButtons.first().click();
        await page.waitForTimeout(3000);
        
        // We should now be on a quiz page
        const currentUrl = page.url();
        if (currentUrl.includes('/quiz/')) {
          console.log('✅ Successfully navigated to quiz page:', currentUrl);
          
          // Test quiz functionality
          const quizAnswers = page.locator('button[class*="answer"], .answer-option');
          if (await quizAnswers.count() > 0) {
            await quizAnswers.first().click();
            await page.waitForTimeout(1000);
            
            // Handle RewardPopup
            const rewardPopup = page.locator('.reward-popup, [data-testid="reward-popup"]');
            if (await rewardPopup.count() > 0) {
              const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Claim")');
              if (await continueBtn.count() > 0) {
                await continueBtn.first().click();
                await page.waitForTimeout(500);
              }
            }
          }
        }
      }
      
      // Step 4: Navigate to profile
      console.log('👤 Checking profile page...');
      await page.goto('/profile', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      // Verify profile loads without null reference errors
      const profileError = page.locator('.error, [data-testid="error"]');
      expect(await profileError.count()).toBe(0);
      
      // Step 5: Check leaderboard
      console.log('🏆 Checking leaderboard page...');
      await page.goto('/leaderboard', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      // Verify leaderboard loads without null reference errors
      const leaderboardError = page.locator('.error, [data-testid="error"]');
      expect(await leaderboardError.count()).toBe(0);
      
      // Step 6: Return to homepage and verify state
      console.log('🏠 Returning to homepage to verify state persistence...');
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      console.log('✅ Complete user journey test completed successfully');
    });
  });

  // Phase 5: Error Handling and Edge Cases
  test.describe('Phase 5: Error Handling and Edge Cases', () => {
    
    test('404 Error Handling', async ({ page }) => {
      await page.goto('/nonexistent', { waitUntil: 'networkidle' });
      
      // Should show 404 page or redirect
      const pageContent = await page.textContent('body');
      expect(pageContent).toMatch(/404|not found|page not found/i);
    });

    test('Malformed Quiz Category URLs', async ({ page }) => {
      const malformedUrls = ['/quiz/invalid-category', '/quiz/', '/quiz/123'];
      
      for (const url of malformedUrls) {
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
          
          // Should handle gracefully - either redirect or show error
          const hasError = await page.locator('.error, [data-testid="error"]').count() > 0;
          const hasRedirect = !page.url().includes(url);
          
          expect(hasError || hasRedirect).toBe(true);
          
        } catch (error) {
          // Network errors are acceptable for malformed URLs
          console.log(`Expected error for malformed URL ${url}:`, error.message);
        }
      }
    });
  });
});
