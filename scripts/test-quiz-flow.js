// Simple test to verify the quiz flow works correctly
const { chromium } = require('playwright');

async function testQuizFlow() {
  console.log('🚀 Starting quiz flow test...');
  
  const browser = await chromium.launch({ headless: false }); // Set to false to see the browser
  const page = await browser.newPage();
  
  try {
    // Listen to console logs
    page.on('console', msg => console.log('🖥️ Browser console:', msg.text()));
    page.on('pageerror', error => console.log('❌ Page error:', error.message));

    // Navigate to the homepage
    console.log('📍 Navigating to homepage...');
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(5000); // Wait longer for loading to complete
    
    // Check if the page loaded correctly
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Check what's actually on the page
    const pageContent = await page.textContent('body');
    console.log('📄 Page content preview:', pageContent.substring(0, 500));

    // Check if the actual quiz interface is visible (from the real homepage)
    const quizVisible = await page.isVisible('text=Which social media platform is known for short-form videos?');
    console.log(`🎯 Quiz visible: ${quizVisible}`);

    // Also check for the welcome message
    const welcomeVisible = await page.isVisible('text=Welcome to TechKwiz!');
    console.log(`👋 Welcome message visible: ${welcomeVisible}`);

    if (!quizVisible && !welcomeVisible) {
      console.log('❌ Quiz not found on homepage');
      return;
    }
    
    // Test the complete quiz flow
    console.log('🎮 Starting quiz flow test...');

    // Question 1: Which social media platform is known for short-form videos?
    console.log('📝 Answering question 1...');
    await page.click('text=TikTok');
    await page.waitForTimeout(3000); // Wait for answer feedback and transition
    console.log('✅ Question 1 completed, should auto-advance to Q2');

    // Question 2: What does 'AI' stand for?
    console.log('📝 Answering question 2...');
    await page.click('text=Artificial Intelligence');
    await page.waitForTimeout(3000);
    console.log('✅ Question 2 completed, should auto-advance to Q3');

    // Question 3: Which company created the iPhone?
    console.log('📝 Answering question 3...');
    await page.click('text=Apple');
    await page.waitForTimeout(3000);
    console.log('✅ Question 3 completed, should auto-advance to Q4');

    // Question 4: What does 'URL' stand for?
    console.log('📝 Answering question 4...');
    await page.click('text=Uniform Resource Locator');
    await page.waitForTimeout(3000);
    console.log('✅ Question 4 completed, should auto-advance to Q5');

    // Question 5: Final question (THIS IS THE KEY TEST)
    console.log('📝 Answering question 5 (FINAL)...');
    await page.click('text=Snake');
    await page.waitForTimeout(3000);
    console.log('✅ Question 5 completed, should show results page');
    
    // Check if results page appears
    await page.waitForTimeout(2000);
    const resultsVisible = await page.isVisible('text=Quiz Complete!');
    const profileCreationVisible = await page.isVisible('text=Create Profile');
    console.log(`📊 Results page visible: ${resultsVisible}`);
    console.log(`👤 Profile creation visible: ${profileCreationVisible}`);
    
    console.log('🎉 Quiz flow test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testQuizFlow().catch(console.error);
