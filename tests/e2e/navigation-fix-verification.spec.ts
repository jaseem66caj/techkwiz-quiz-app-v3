import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';

test.describe('Navigation Fix Verification', () => {
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
    });
  });

  test('Verify Navigation Button Appears After Quiz Completion', async () => {
    console.log('🔍 Testing navigation fix after deployment...');
    
    // Load homepage
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Homepage loaded');
    
    // Get quiz questions from localStorage
    const quizData = await page.evaluate(() => {
      const questions = localStorage.getItem('admin_quiz_questions');
      return questions ? JSON.parse(questions) : null;
    });
    
    if (quizData && Array.isArray(quizData)) {
      console.log(`📝 Found ${quizData.length} quiz questions`);
      
      // Answer the first question to trigger quiz completion flow
      const firstQuestion = quizData[0];
      const correctAnswer = firstQuestion.options[firstQuestion.correct_answer];
      
      console.log(`❓ Answering: ${firstQuestion.question}`);
      console.log(`✅ Correct answer: ${correctAnswer}`);
      
      // Click the correct answer
      const answerButton = page.locator(`button:has-text("${correctAnswer}")`);
      const buttonCount = await answerButton.count();
      
      if (buttonCount > 0) {
        await answerButton.first().click();
        await page.waitForTimeout(2000); // Wait for quiz completion
        
        console.log('🎯 Answered first question, checking for navigation options...');
        
        // Look for the new navigation button
        const navigationButtons = [
          'button:has-text("Start Quiz Categories")',
          'button:has-text("🚀 Start Quiz Categories")',
          'text="Start Quiz Categories"',
          'text="🚀 Start Quiz Categories"'
        ];
        
        let navigationFound = false;
        
        for (const selector of navigationButtons) {
          const count = await page.locator(selector).count();
          if (count > 0) {
            console.log(`✅ Found navigation button: ${selector} (${count} elements)`);
            navigationFound = true;
            
            // Try to click the navigation button
            try {
              await page.locator(selector).first().click();
              await page.waitForTimeout(2000);
              
              const newUrl = page.url();
              console.log(`🔗 After clicking navigation button, URL: ${newUrl}`);
              
              if (newUrl.includes('/start')) {
                console.log('🎉 SUCCESS: Navigation to /start page works!');
                
                // Verify categories are visible
                const categoryElements = await page.locator('[data-testid*="category"], .category, [class*="category"]').count();
                console.log(`📂 Categories visible on /start page: ${categoryElements}`);
                
              } else {
                console.log(`❌ Navigation button clicked but went to: ${newUrl}`);
              }
              
            } catch (error) {
              console.error(`❌ Failed to click navigation button: ${error}`);
            }
            
            break;
          }
        }
        
        if (!navigationFound) {
          console.log('❌ ISSUE PERSISTS: No navigation button found after quiz completion');
          
          // Take screenshot for debugging
          await page.screenshot({ 
            path: 'test-results-production/navigation-fix-verification-failed.png', 
            fullPage: true 
          });
        } else {
          console.log('✅ FIX VERIFIED: Navigation button found and working');
          
          // Take screenshot of success
          await page.screenshot({ 
            path: 'test-results-production/navigation-fix-verification-success.png', 
            fullPage: true 
          });
        }
        
      } else {
        console.log(`❌ Could not find answer button for: ${correctAnswer}`);
      }
      
    } else {
      console.log('❌ No quiz questions found in localStorage');
    }
  });

  test('Verify Both Navigation Options Available', async () => {
    console.log('🔍 Testing both navigation options after quiz completion...');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Complete quiz (simplified - just click first available button)
    const quizButtons = await page.locator('button').all();
    if (quizButtons.length > 0) {
      await quizButtons[0].click();
      await page.waitForTimeout(3000); // Wait for completion
      
      // Check for both navigation options
      const startQuizButton = await page.locator('button:has-text("Start Quiz Categories"), text="Start Quiz Categories"').count();
      const createProfileButton = await page.locator('button:has-text("Create Profile"), text="Create Profile"').count();
      
      console.log(`🚀 "Start Quiz Categories" buttons found: ${startQuizButton}`);
      console.log(`👤 "Create Profile" buttons found: ${createProfileButton}`);
      
      if (startQuizButton > 0 && createProfileButton > 0) {
        console.log('✅ SUCCESS: Both navigation options are available');
      } else {
        console.log('❌ ISSUE: Missing navigation options');
        console.log(`   Start Quiz: ${startQuizButton > 0 ? '✅' : '❌'}`);
        console.log(`   Create Profile: ${createProfileButton > 0 ? '✅' : '❌'}`);
      }
      
      await page.screenshot({ 
        path: 'test-results-production/both-navigation-options.png', 
        fullPage: true 
      });
    }
  });

  test('Test Navigation Button Functionality', async () => {
    console.log('🔍 Testing navigation button functionality...');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Simulate quiz completion by clicking any available button
    const buttons = await page.locator('button').all();
    if (buttons.length > 0) {
      await buttons[0].click();
      await page.waitForTimeout(3000);
      
      // Look for and click the Start Quiz Categories button
      const startButton = page.locator('button:has-text("Start Quiz Categories")').first();
      const startButtonExists = await startButton.count() > 0;
      
      if (startButtonExists) {
        console.log('✅ Start Quiz Categories button found');
        
        // Click the button
        await startButton.click();
        await page.waitForTimeout(2000);
        
        // Verify navigation
        const currentUrl = page.url();
        console.log(`🔗 Current URL after click: ${currentUrl}`);
        
        if (currentUrl.includes('/start')) {
          console.log('🎉 SUCCESS: Navigation button works correctly');
          
          // Verify page content
          const pageContent = await page.locator('body').textContent();
          if (pageContent && pageContent.length > 1000) {
            console.log('✅ /start page loaded with substantial content');
          } else {
            console.log('❌ /start page appears empty or failed to load properly');
          }
          
        } else {
          console.log(`❌ Navigation failed - redirected to: ${currentUrl}`);
        }
        
      } else {
        console.log('❌ Start Quiz Categories button not found');
      }
      
      await page.screenshot({ 
        path: 'test-results-production/navigation-functionality-test.png', 
        fullPage: true 
      });
    }
  });
});
