import { test, expect, Page, BrowserContext } from '@playwright/test';

// Production URL for testing
const PRODUCTION_URL = 'https://play.techkwiz.com';

// Test configuration for production
test.describe('TechKwiz v8 Production Navigation Tests', () => {
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

  test('1. Homepage Quiz Flow - Complete User Journey', async () => {
    console.log('🧪 Testing: Homepage Quiz Flow');
    
    // Step 1: Load homepage
    console.log('📍 Step 1: Loading homepage...');
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    
    // Verify homepage loads correctly
    await expect(page).toHaveTitle(/TechKwiz/);
    console.log('✅ Homepage loaded successfully');

    // Step 2: Check for quiz elements
    console.log('📍 Step 2: Checking for quiz elements...');
    
    // Look for quiz questions or start button
    const quizElements = await page.locator('[data-testid*="quiz"], .quiz, [class*="quiz"]').count();
    console.log(`📊 Found ${quizElements} quiz-related elements`);

    // Check for navigation elements
    const navElements = await page.locator('nav, [role="navigation"], .navigation').count();
    console.log(`🧭 Found ${navElements} navigation elements`);

    // Step 3: Look for "Start Quiz" or similar buttons
    console.log('📍 Step 3: Looking for quiz start elements...');
    
    const startButtons = await page.locator('button:has-text("Start"), a:has-text("Start"), [href*="/start"]').count();
    console.log(`🎯 Found ${startButtons} start-related buttons/links`);

    // Step 4: Attempt to navigate to /start page
    console.log('📍 Step 4: Attempting navigation to /start...');
    
    try {
      await page.goto(`${PRODUCTION_URL}/start`);
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

    // Step 5: Take screenshot for analysis
    await page.screenshot({ 
      path: 'test-results/homepage-quiz-flow.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved: homepage-quiz-flow.png');
  });

  test('2. Authentication State Testing', async () => {
    console.log('🧪 Testing: Authentication State');
    
    // Load homepage and check authentication state
    await page.goto(PRODUCTION_URL);
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
      path: 'test-results/authentication-state.png', 
      fullPage: true 
    });
  });

  test('3. Error Boundary and Error Handling', async () => {
    console.log('🧪 Testing: Error Boundary and Error Handling');
    
    // Test various routes for error handling
    const routes = ['/', '/start', '/profile', '/leaderboard'];
    
    for (const route of routes) {
      console.log(`📍 Testing route: ${route}`);
      
      try {
        await page.goto(`${PRODUCTION_URL}${route}`);
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
      path: 'test-results/error-handling.png', 
      fullPage: true 
    });
  });

  test('4. Network and Performance Analysis', async () => {
    console.log('🧪 Testing: Network and Performance');
    
    // Track network requests
    const requests: string[] = [];
    const failedRequests: string[] = [];
    
    page.on('request', request => {
      requests.push(request.url());
    });
    
    page.on('requestfailed', request => {
      failedRequests.push(`${request.url()} - ${request.failure()?.errorText}`);
    });
    
    // Measure page load time
    const startTime = Date.now();
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ Page load time: ${loadTime}ms`);
    console.log(`📡 Total requests: ${requests.length}`);
    console.log(`❌ Failed requests: ${failedRequests.length}`);
    
    if (failedRequests.length > 0) {
      console.log('❌ Failed requests details:');
      failedRequests.forEach(req => console.log(`  - ${req}`));
    }
    
    // Check for critical resources
    const criticalResources = requests.filter(url => 
      url.includes('.js') || url.includes('.css') || url.includes('api')
    );
    console.log(`🔧 Critical resources loaded: ${criticalResources.length}`);
    
    await page.screenshot({ 
      path: 'test-results/network-performance.png', 
      fullPage: true 
    });
  });

  test('5. Mobile Responsiveness', async () => {
    console.log('🧪 Testing: Mobile Responsiveness');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    
    // Check for mobile-specific elements
    const mobileElements = await page.locator('[class*="mobile"], [class*="sm:"], [class*="md:"]').count();
    console.log(`📱 Found ${mobileElements} mobile-responsive elements`);
    
    // Test navigation on mobile
    try {
      await page.goto(`${PRODUCTION_URL}/start`);
      await page.waitForLoadState('networkidle');
      console.log('✅ Mobile navigation to /start successful');
    } catch (error) {
      console.error(`❌ Mobile navigation failed: ${error}`);
    }
    
    await page.screenshot({ 
      path: 'test-results/mobile-responsiveness.png', 
      fullPage: true 
    });
  });
});
