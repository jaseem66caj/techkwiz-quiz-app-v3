import { test, expect, Page, BrowserContext } from '@playwright/test';

// Local development URL - using port 3003 as shown in the server output
const LOCAL_URL = 'http://localhost:3003';

// Test configuration for local development
test.describe('TechKwiz v8 Local Navigation Tests', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    // Create new context for each test to ensure clean state
    context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    page = await context.newPage();
    
    // Enable console logging to capture JavaScript errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`❌ Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        console.warn(`⚠️ Console Warning: ${msg.text()}`);
      } else {
        console.log(`ℹ️ Console Log: ${msg.text()}`);
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      console.error(`❌ Page Error: ${error.message}`);
    });

    // Capture network failures
    page.on('requestfailed', request => {
      console.error(`❌ Network Error: ${request.url()} - ${request.failure()?.errorText}`);
    });
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('1. Homepage Navigation and Quiz Access', async () => {
    console.log('🧪 Testing: Homepage Navigation and Quiz Access');
    
    // Step 1: Load homepage
    console.log('📍 Step 1: Loading homepage...');
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');
    
    // Verify homepage loads correctly
    await expect(page).toHaveTitle(/TechKwiz/);
    console.log('✅ Homepage loaded successfully');

    // Check for console errors on homepage
    console.log('📍 Step 2: Checking for console errors on homepage...');
    
    // Step 3: Check for quiz elements
    console.log('📍 Step 3: Checking for quiz elements...');
    
    // Look for quiz questions or start button
    const quizElements = await page.locator('[data-testid*="quiz"], .quiz, [class*="quiz"]').count();
    console.log(`📊 Found ${quizElements} quiz-related elements`);

    // Check for navigation elements
    const navElements = await page.locator('nav, [role="navigation"], .navigation').count();
    console.log(`🧭 Found ${navElements} navigation elements`);

    // Step 4: Look for "Start Quiz" or similar buttons
    console.log('📍 Step 4: Looking for quiz start elements...');
    
    const startButtons = await page.locator('button:has-text("Start"), a:has-text("Start"), [href*="/start"]').count();
    console.log(`🎯 Found ${startButtons} start-related buttons/links`);

    // Step 5: Attempt to navigate to /start page
    console.log('📍 Step 5: Attempting navigation to /start...');
    
    try {
      await page.goto(`${LOCAL_URL}/start`);
      await page.waitForLoadState('networkidle');
      
      // Check if /start page loads successfully
      const currentUrl = page.url();
      console.log(`🔗 Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('/start')) {
        console.log('✅ Successfully navigated to /start page');
        
        // Check for category elements
        const categories = await page.locator('[data-testid*="category"], .category, [class*="category"]').count();
        console.log(`📂 Found ${categories} category elements`);
        
        // Check for loading states
        const loadingElements = await page.locator('[data-testid*="loading"], .loading, [class*="loading"]').count();
        console.log(`⏳ Found ${loadingElements} loading elements`);
        
        // Check for error messages
        const errorElements = await page.locator('[data-testid*="error"], .error, [class*="error"]').count();
        console.log(`❌ Found ${errorElements} error elements`);
        
      } else {
        console.log('❌ Failed to navigate to /start page - redirected elsewhere');
      }
      
    } catch (error) {
      console.error(`❌ Navigation to /start failed: ${error}`);
    }

    // Step 6: Take screenshot for analysis
    await page.screenshot({ 
      path: 'test-results/local-homepage-quiz-flow.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved: local-homepage-quiz-flow.png');
  });

  test('2. Category Quiz Access', async () => {
    console.log('🧪 Testing: Category Quiz Access');
    
    // Navigate to start page
    console.log('📍 Navigating to /start page...');
    await page.goto(`${LOCAL_URL}/start`);
    await page.waitForLoadState('networkidle');
    
    // Check if categories are visible
    const categoryCards = await page.locator('[data-testid="category-card"]').count();
    console.log(`📂 Found ${categoryCards} category cards`);
    
    if (categoryCards > 0) {
      // Try to click on the first category
      console.log('📍 Attempting to access first category quiz...');
      try {
        const firstCategory = page.locator('[data-testid="category-card"]').first();
        const categoryName = await firstCategory.textContent();
        console.log(`🎯 Attempting to access category: ${categoryName}`);
        
        await firstCategory.click();
        await page.waitForLoadState('networkidle');
        
        // Check if we navigated to a quiz page
        const currentUrl = page.url();
        console.log(`🔗 Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/quiz/')) {
          console.log('✅ Successfully navigated to category quiz page');
          
          // Check for quiz elements
          const quizQuestion = await page.locator('[data-testid="quiz-question"]').count();
          const quizOptions = await page.locator('[data-testid="quiz-option"]').count();
          
          console.log(`❓ Quiz questions found: ${quizQuestion}`);
          console.log(`🔢 Quiz options found: ${quizOptions}`);
          
          if (quizQuestion > 0 && quizOptions > 0) {
            console.log('✅ Quiz interface loaded correctly');
          } else {
            console.log('❌ Quiz interface elements missing');
          }
        } else {
          console.log('❌ Did not navigate to quiz page as expected');
        }
      } catch (error) {
        console.error(`❌ Failed to access category quiz: ${error}`);
      }
    } else {
      console.log('❌ No category cards found on /start page');
    }
    
    await page.screenshot({ 
      path: 'test-results/local-category-quiz-access.png', 
      fullPage: true 
    });
  });

  test('3. Profile Page Access', async () => {
    console.log('🧪 Testing: Profile Page Access');
    
    // Navigate to profile page
    console.log('📍 Navigating to /profile page...');
    await page.goto(`${LOCAL_URL}/profile`);
    await page.waitForLoadState('networkidle');
    
    // Check if profile page loads
    const currentUrl = page.url();
    console.log(`🔗 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/profile')) {
      console.log('✅ Successfully navigated to profile page');
      
      // Check for profile elements
      const profileElements = await page.locator('[data-testid*="profile"], .profile').count();
      console.log(`👤 Found ${profileElements} profile-related elements`);
      
      // Check for user info
      const userInfo = await page.locator('[data-testid="user-info"]').count();
      console.log(`ℹ️ Found ${userInfo} user info elements`);
      
    } else {
      console.log('❌ Failed to navigate to profile page');
    }
    
    await page.screenshot({ 
      path: 'test-results/local-profile-access.png', 
      fullPage: true 
    });
  });

  test('4. Authentication Flow Testing', async () => {
    console.log('🧪 Testing: Authentication Flow');
    
    // Load homepage and check authentication state
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');
    
    // Check localStorage for user data
    const userState = await page.evaluate(() => {
      return {
        localStorage: Object.keys(localStorage).reduce((acc, key) => {
          acc[key] = localStorage.getItem(key);
          return acc;
        }, {} as Record<string, string | null>),
        sessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
          acc[key] = sessionStorage.getItem(key);
          return acc;
        }, {} as Record<string, string | null>)
      };
    });
    
    console.log('💾 User State:', JSON.stringify(userState, null, 2));
    
    // Check for authentication-related elements
    const authElements = await page.locator('[data-testid*="auth"], [class*="auth"], [data-testid*="user"], [class*="user"]').count();
    console.log(`👤 Found ${authElements} authentication-related elements`);
    
    await page.screenshot({ 
      path: 'test-results/local-auth-flow.png', 
      fullPage: true 
    });
  });

  test('5. Error Boundary and Error Handling', async () => {
    console.log('🧪 Testing: Error Boundary and Error Handling');
    
    // Test various routes for error handling
    const routes = ['/', '/start', '/profile', '/leaderboard', '/nonexistent'];
    
    for (const route of routes) {
      console.log(`📍 Testing route: ${route}`);
      
      try {
        await page.goto(`${LOCAL_URL}${route}`);
        await page.waitForLoadState('networkidle');
        
        // Check for error boundary activation
        const errorBoundary = await page.locator('[data-testid*="error-boundary"], .error-boundary').count();
        const errorMessages = await page.locator('text="Something went wrong", text="Error", text="Oops"').count();
        
        console.log(`🛡️ Route ${route}: Error boundary elements: ${errorBoundary}, Error messages: ${errorMessages}`);
        
        // Check if page loaded successfully
        const pageContent = await page.locator('body').textContent();
        if (pageContent && pageContent.length > 100) {
          console.log(`✅ Route ${route}: Page loaded with content`);
        } else {
          console.log(`❌ Route ${route}: Page appears empty or failed to load`);
        }
        
      } catch (error) {
        console.error(`❌ Route ${route} failed: ${error}`);
      }
    }
    
    await page.screenshot({ 
      path: 'test-results/local-error-handling.png', 
      fullPage: true 
    });
  });
});