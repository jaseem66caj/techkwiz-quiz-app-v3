const { chromium } = require('playwright');
const fs = require('fs').promises;

async function captureWorkingPages() {
  console.log('🚀 Capturing working pages...');
  
  // Create directories if they don't exist
  await fs.mkdir('docs/design-docs/screenshots/desktop', { recursive: true });
  
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  // Capture homepage
  console.log('📸 Capturing homepage...');
  await page.goto('http://localhost:3002/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: 'docs/design-docs/screenshots/desktop/homepage.png',
    fullPage: true 
  });
  console.log('✅ Homepage captured');
  
  // Capture profile page
  console.log('📸 Capturing profile page...');
  await page.goto('http://localhost:3002/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: 'docs/design-docs/screenshots/desktop/profile-page.png',
    fullPage: true 
  });
  console.log('✅ Profile page captured');
  
  await context.close();
  await browser.close();
  
  console.log('🎉 Working pages captured successfully!');
  console.log('📁 Screenshots saved in docs/design-docs/screenshots/desktop/');
}

captureWorkingPages().catch(console.error);