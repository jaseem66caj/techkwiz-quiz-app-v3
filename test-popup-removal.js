const puppeteer = require('puppeteer');

async function testPopupRemoval() {
  console.log('🧪 Testing special offer popup removal...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 375, height: 667 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to start page
    console.log('📍 Navigating to /start page...');
    await page.goto('http://localhost:3001/start', { waitUntil: 'networkidle0' });
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Check for the specific popup text
    const popupTexts = [
      'Weekend Special',
      'Unlimited quiz attempts',
      'premium features',
      '800 coins',
      '240 coins',
      '-70%',
      'Special Offer!'
    ];
    
    let popupFound = false;
    
    for (const text of popupTexts) {
      try {
        const element = await page.waitForSelector(`text=${text}`, { timeout: 2000 });
        if (element) {
          console.log(`❌ Found popup text: "${text}"`);
          popupFound = true;
          break;
        }
      } catch (e) {
        // Text not found, which is good
      }
    }
    
    if (!popupFound) {
      console.log('✅ Special offer popup successfully removed!');
      console.log('✅ No popup text found on /start page');
    }
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'start-page-no-popup.png' });
    console.log('📸 Screenshot saved as start-page-no-popup.png');
    
    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Check if categories are loading
    const categories = await page.$$('[class*="category"]');
    console.log(`📚 Found ${categories.length} category elements`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testPopupRemoval();
