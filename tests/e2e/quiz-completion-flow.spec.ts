import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';

test.describe('Quiz Completion Flow - Critical Navigation Issue', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    page = await context.newPage();
    
    // Enhanced logging for debugging
    page.on('console', msg => {
      console.log(`🖥️ Console [${msg.type()}]: ${msg.text()}`);
    });

    page.on('pageerror', error => {
      console.error(`❌ Page Error: ${error.message}`);
    });
  });

  test('Complete Homepage Quiz and Test Navigation', async () => {
    console.log('🎯 Testing complete homepage quiz flow...');
    
    // Step 1: Load homepage
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Homepage loaded');
    
    // Step 2: Identify quiz questions
    const quizButtons = await page.locator('button').all();
    console.log(`🔘 Found ${quizButtons.length} buttons on homepage`);
    
    // Get the quiz questions from localStorage
    const quizData = await page.evaluate(() => {
      const questions = localStorage.getItem('admin_quiz_questions');
      return questions ? JSON.parse(questions) : null;
    });
    
    if (quizData && Array.isArray(quizData)) {
      console.log(`📝 Found ${quizData.length} quiz questions in localStorage`);
      
      // Step 3: Answer each question correctly
      for (let i = 0; i < quizData.length; i++) {
        const question = quizData[i];
        const correctAnswer = question.options[question.correct_answer];
        
        console.log(`❓ Question ${i + 1}: ${question.question}`);
        console.log(`✅ Correct answer: ${correctAnswer}`);
        
        // Find and click the correct answer button
        try {
          const answerButton = page.locator(`button:has-text("${correctAnswer}")`);
          const buttonCount = await answerButton.count();
          
          if (buttonCount > 0) {
            console.log(`🎯 Clicking correct answer: ${correctAnswer}`);
            await answerButton.first().click();
            await page.waitForTimeout(1000); // Wait for any animations/state changes
            
            // Check if coins were awarded
            const userState = await page.evaluate(() => {
              const user = localStorage.getItem('techkwiz_user');
              return user ? JSON.parse(user) : null;
            });
            
            if (userState) {
              console.log(`🪙 User coins after question ${i + 1}: ${userState.coins}`);
            }
          } else {
            console.log(`❌ Could not find button for answer: ${correctAnswer}`);
          }
        } catch (error) {
          console.error(`❌ Error clicking answer: ${error}`);
        }
        
        // Wait between questions
        await page.waitForTimeout(500);
      }
      
      // Step 4: Check final state after completing all questions
      const finalUserState = await page.evaluate(() => {
        const user = localStorage.getItem('techkwiz_user');
        return user ? JSON.parse(user) : null;
      });
      
      console.log(`🏁 Final user state:`, finalUserState);
      
      // Step 5: Look for navigation elements that should appear after quiz completion
      await page.waitForTimeout(2000); // Wait for any post-quiz UI changes
      
      const navigationElements = [
        'button:has-text("Start Quiz")',
        'a:has-text("Start Quiz")',
        'button:has-text("Continue")',
        'a:has-text("Continue")',
        'button:has-text("Next")',
        'a:has-text("Next")',
        '[href="/start"]',
        '[data-testid*="start"]',
        '[data-testid*="continue"]',
        '[data-testid*="next"]'
      ];
      
      console.log('🔍 Looking for navigation elements after quiz completion...');
      
      for (const selector of navigationElements) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`✅ Found ${count} elements matching: ${selector}`);
          
          // Try to click the first one
          try {
            const element = page.locator(selector).first();
            const text = await element.textContent();
            const href = await element.getAttribute('href');
            
            console.log(`🎯 Attempting to click: "${text}" ${href ? `(href: ${href})` : ''}`);
            
            await element.click();
            await page.waitForTimeout(2000);
            
            const newUrl = page.url();
            console.log(`🔗 After click, URL: ${newUrl}`);
            
            if (newUrl.includes('/start')) {
              console.log('✅ Successfully navigated to /start page!');
              
              // Check if categories are visible
              const categoryElements = await page.locator('[data-testid*="category"], .category, [class*="category"]').count();
              console.log(`📂 Categories visible: ${categoryElements}`);
              
              break;
            } else if (newUrl !== BASE_URL) {
              console.log(`🔄 Navigated to different page: ${newUrl}`);
            } else {
              console.log('❌ No navigation occurred');
            }
            
          } catch (error) {
            console.error(`❌ Failed to click navigation element: ${error}`);
          }
        }
      }
      
      // Step 6: If no navigation elements found, check page content for clues
      const pageContent = await page.content();
      const hasStartText = pageContent.toLowerCase().includes('start quiz') || 
                          pageContent.toLowerCase().includes('continue') ||
                          pageContent.toLowerCase().includes('next level');
      
      console.log(`📄 Page contains navigation text: ${hasStartText}`);
      
      if (!hasStartText) {
        console.log('❌ CRITICAL ISSUE: No navigation options found after quiz completion');
        console.log('🔍 This confirms the reported issue - users cannot progress beyond homepage quiz');
      }
      
    } else {
      console.log('❌ No quiz questions found in localStorage');
    }
    
    // Step 7: Take screenshots for analysis
    await page.screenshot({ 
      path: 'test-results-production/quiz-completion-state.png', 
      fullPage: true 
    });
    
    // Step 8: Test direct navigation to /start as fallback
    console.log('🔄 Testing direct navigation to /start as fallback...');
    await page.goto(`${BASE_URL}/start`);
    await page.waitForLoadState('networkidle');
    
    const startPageUrl = page.url();
    if (startPageUrl.includes('/start')) {
      console.log('✅ Direct navigation to /start works');
      
      // Check authentication state on /start page
      const authState = await page.evaluate(() => {
        const user = localStorage.getItem('techkwiz_user');
        return user ? JSON.parse(user) : null;
      });
      
      console.log('👤 Auth state on /start page:', authState);
      
      // Check for any error messages
      const errorText = await page.locator('text="error", text="Error", text="failed", text="Failed"').count();
      console.log(`❌ Error messages on /start page: ${errorText}`);
      
    } else {
      console.log(`❌ Direct navigation to /start failed, redirected to: ${startPageUrl}`);
    }
    
    await page.screenshot({ 
      path: 'test-results-production/start-page-after-quiz.png', 
      fullPage: true 
    });
  });

  test('Test Navigation Without Quiz Completion', async () => {
    console.log('🧪 Testing navigation without completing quiz...');
    
    // Load homepage but don't complete quiz
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Try to navigate directly to /start
    await page.goto(`${BASE_URL}/start`);
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    console.log(`🔗 Navigation without quiz completion result: ${url}`);
    
    if (url.includes('/start')) {
      console.log('✅ Can access /start without quiz completion');
    } else {
      console.log('❌ Redirected away from /start without quiz completion');
    }
    
    await page.screenshot({ 
      path: 'test-results-production/navigation-without-quiz.png', 
      fullPage: true 
    });
  });
});
