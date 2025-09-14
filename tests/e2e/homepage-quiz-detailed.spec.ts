import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';

test.describe('Homepage Quiz Flow - Detailed Analysis', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    page = await context.newPage();
    
    // Enhanced logging
    page.on('console', msg => {
      console.log(`🖥️ Console [${msg.type()}]: ${msg.text()}`);
    });

    page.on('pageerror', error => {
      console.error(`❌ Page Error: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
    });
  });

  test('Detailed Homepage Quiz Analysis', async () => {
    console.log('🔍 Starting detailed homepage quiz analysis...');
    
    // Step 1: Load homepage and analyze structure
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    console.log('📊 Analyzing page structure...');
    
    // Get all interactive elements
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    const inputs = await page.locator('input').count();
    
    console.log(`🔘 Interactive elements: ${buttons} buttons, ${links} links, ${inputs} inputs`);
    
    // Check for quiz-related content
    const pageContent = await page.content();
    const hasQuizContent = pageContent.includes('quiz') || pageContent.includes('Quiz');
    const hasStartContent = pageContent.includes('start') || pageContent.includes('Start');
    
    console.log(`📝 Content analysis: Quiz content: ${hasQuizContent}, Start content: ${hasStartContent}`);
    
    // Look for specific quiz elements
    const quizSelectors = [
      '[data-testid*="quiz"]',
      '.quiz',
      '[class*="quiz"]',
      'button:has-text("Start")',
      'a:has-text("Start")',
      '[href*="/start"]',
      '[data-quiz]',
      '.question',
      '[class*="question"]'
    ];
    
    for (const selector of quizSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✅ Found ${count} elements matching: ${selector}`);
        
        // Get text content of found elements
        const elements = await page.locator(selector).all();
        for (let i = 0; i < Math.min(elements.length, 3); i++) {
          const text = await elements[i].textContent();
          console.log(`   📄 Element ${i + 1} text: "${text?.substring(0, 100)}..."`);
        }
      }
    }
    
    // Check localStorage for quiz data
    const localStorageData = await page.evaluate(() => {
      const data: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key);
            data[key] = value ? JSON.parse(value) : value;
          } catch {
            data[key] = localStorage.getItem(key);
          }
        }
      }
      return data;
    });
    
    console.log('💾 LocalStorage analysis:');
    Object.keys(localStorageData).forEach(key => {
      console.log(`   🔑 ${key}: ${typeof localStorageData[key]} ${Array.isArray(localStorageData[key]) ? `(${localStorageData[key].length} items)` : ''}`);
    });
    
    // Check if user is already authenticated
    const userState = localStorageData.techkwiz_user;
    if (userState) {
      console.log(`👤 User state: ${userState.name}, Coins: ${userState.coins}, Level: ${userState.level}`);
    }
    
    // Look for navigation elements
    const navSelectors = [
      'nav',
      '[role="navigation"]',
      '.navigation',
      '.nav',
      'header',
      '.header'
    ];
    
    for (const selector of navSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`🧭 Found ${count} navigation elements: ${selector}`);
      }
    }
    
    // Test direct navigation to /start
    console.log('🎯 Testing direct navigation to /start...');
    await page.goto(`${BASE_URL}/start`);
    await page.waitForLoadState('networkidle');
    
    const startPageUrl = page.url();
    console.log(`🔗 /start page URL: ${startPageUrl}`);
    
    if (startPageUrl.includes('/start')) {
      console.log('✅ Successfully reached /start page');
      
      // Analyze /start page content
      const startPageContent = await page.content();
      const hasCategories = startPageContent.includes('category') || startPageContent.includes('Category');
      const hasLoading = startPageContent.includes('loading') || startPageContent.includes('Loading');
      const hasError = startPageContent.includes('error') || startPageContent.includes('Error');
      
      console.log(`📊 /start page analysis: Categories: ${hasCategories}, Loading: ${hasLoading}, Error: ${hasError}`);
      
      // Look for category elements
      const categorySelectors = [
        '[data-testid*="category"]',
        '.category',
        '[class*="category"]',
        'button[data-category]',
        '.quiz-category',
        '[class*="quiz-category"]'
      ];
      
      for (const selector of categorySelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`📂 Found ${count} category elements: ${selector}`);
        }
      }
      
      // Check for any visible text content
      const visibleText = await page.locator('body').textContent();
      if (visibleText && visibleText.trim().length > 0) {
        console.log(`📄 /start page has ${visibleText.length} characters of content`);
        console.log(`📄 First 200 characters: "${visibleText.substring(0, 200)}..."`);
      } else {
        console.log('❌ /start page appears to have no visible content');
      }
      
    } else {
      console.log(`❌ Redirected away from /start to: ${startPageUrl}`);
    }
    
    // Take comprehensive screenshots
    await page.screenshot({ 
      path: 'test-results-production/homepage-detailed-analysis.png', 
      fullPage: true 
    });
    
    // Go back to homepage and take screenshot
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results-production/homepage-structure.png', 
      fullPage: true 
    });
    
    console.log('📸 Screenshots saved for detailed analysis');
  });

  test('Quiz Interaction Simulation', async () => {
    console.log('🎮 Testing quiz interaction simulation...');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Try to find and interact with any quiz elements
    const interactiveElements = await page.locator('button, a, input[type="button"], input[type="submit"]').all();
    
    console.log(`🔘 Found ${interactiveElements.length} interactive elements`);
    
    for (let i = 0; i < Math.min(interactiveElements.length, 10); i++) {
      const element = interactiveElements[i];
      const text = await element.textContent();
      const tagName = await element.evaluate(el => el.tagName);
      const href = await element.getAttribute('href');
      
      console.log(`🔘 Element ${i + 1}: ${tagName} - "${text}" ${href ? `(href: ${href})` : ''}`);
      
      // If this looks like a start or quiz button, try clicking it
      if (text && (text.toLowerCase().includes('start') || text.toLowerCase().includes('quiz'))) {
        console.log(`🎯 Attempting to click: "${text}"`);
        try {
          await element.click();
          await page.waitForTimeout(2000); // Wait for any navigation
          const newUrl = page.url();
          console.log(`🔗 After click, URL: ${newUrl}`);
          
          if (newUrl !== BASE_URL) {
            console.log('✅ Navigation occurred after click');
            break;
          }
        } catch (error) {
          console.log(`❌ Click failed: ${error}`);
        }
      }
    }
    
    await page.screenshot({ 
      path: 'test-results-production/quiz-interaction-test.png', 
      fullPage: true 
    });
  });
});
