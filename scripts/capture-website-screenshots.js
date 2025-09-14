const { chromium } = require('playwright');
const fs = require('fs').promises;

async function captureScreenshots() {
  console.log('🚀 Starting website screenshot capture...');
  
  // Create directories if they don't exist
  await fs.mkdir('docs/design-docs/screenshots', { recursive: true });
  await fs.mkdir('docs/design-docs/screenshots/desktop', { recursive: true });
  await fs.mkdir('docs/design-docs/screenshots/mobile', { recursive: true });
  await fs.mkdir('docs/design-docs/screenshots/tablet', { recursive: true });
  
  const browser = await chromium.launch();
  
  // Desktop viewport
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  
  // Mobile viewport
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  
  // Tablet viewport
  const tabletContext = await browser.newContext({
    viewport: { width: 768, height: 1024 }
  });
  
  const pages = [
    { path: '/', name: 'homepage' },
    { path: '/start', name: 'start-page' },
    { path: '/profile', name: 'profile-page' },
    { path: '/leaderboard', name: 'leaderboard-page' },
    { path: '/about', name: 'about-page' },
    { path: '/privacy', name: 'privacy-page' }
  ];
  
  // Capture desktop screenshots
  console.log('🖥️ Capturing desktop screenshots...');
  const desktopPage = await desktopContext.newPage();
  for (const page of pages) {
    try {
      console.log(`📸 Capturing ${page.name} (desktop)`);
      await desktopPage.goto(`http://localhost:3002${page.path}`);
      await desktopPage.waitForLoadState('networkidle');
      await desktopPage.waitForTimeout(2000); // Wait for animations
      await desktopPage.screenshot({ 
        path: `docs/design-docs/screenshots/desktop/${page.name}.png`,
        fullPage: true 
      });
      console.log(`✅ Saved desktop/${page.name}.png`);
    } catch (error) {
      console.error(`❌ Failed to capture ${page.name} (desktop):`, error.message);
    }
  }
  
  // Capture mobile screenshots
  console.log('📱 Capturing mobile screenshots...');
  const mobilePage = await mobileContext.newPage();
  for (const page of pages) {
    try {
      console.log(`📸 Capturing ${page.name} (mobile)`);
      await mobilePage.goto(`http://localhost:3002${page.path}`);
      await mobilePage.waitForLoadState('networkidle');
      await mobilePage.waitForTimeout(2000); // Wait for animations
      await mobilePage.screenshot({ 
        path: `docs/design-docs/screenshots/mobile/${page.name}.png`,
        fullPage: true 
      });
      console.log(`✅ Saved mobile/${page.name}.png`);
    } catch (error) {
      console.error(`❌ Failed to capture ${page.name} (mobile):`, error.message);
    }
  }
  
  // Capture tablet screenshots
  console.log('📟 Capturing tablet screenshots...');
  const tabletPage = await tabletContext.newPage();
  for (const page of pages) {
    try {
      console.log(`📸 Capturing ${page.name} (tablet)`);
      await tabletPage.goto(`http://localhost:3002${page.path}`);
      await tabletPage.waitForLoadState('networkidle');
      await tabletPage.waitForTimeout(2000); // Wait for animations
      await tabletPage.screenshot({ 
        path: `docs/design-docs/screenshots/tablet/${page.name}.png`,
        fullPage: true 
      });
      console.log(`✅ Saved tablet/${page.name}.png`);
    } catch (error) {
      console.error(`❌ Failed to capture ${page.name} (tablet):`, error.message);
    }
  }
  
  // Capture quiz flow screenshots
  console.log('📝 Capturing quiz flow screenshots...');
  try {
    console.log('📸 Capturing category selection');
    await desktopPage.goto('http://localhost:3002/start');
    await desktopPage.waitForLoadState('networkidle');
    await desktopPage.waitForTimeout(2000);
    await desktopPage.screenshot({ 
      path: 'docs/design-docs/screenshots/desktop/quiz-category-selection.png',
      fullPage: true 
    });
    console.log('✅ Saved desktop/quiz-category-selection.png');
    
    // Try to click on a category to go to quiz
    const categoryCard = await desktopPage.$('[data-testid="category-card"]');
    if (categoryCard) {
      console.log('📸 Capturing quiz interface');
      await categoryCard.click();
      await desktopPage.waitForLoadState('networkidle');
      await desktopPage.waitForTimeout(2000);
      await desktopPage.screenshot({ 
        path: 'docs/design-docs/screenshots/desktop/quiz-interface.png',
        fullPage: true 
      });
      console.log('✅ Saved desktop/quiz-interface.png');
    }
  } catch (error) {
    console.error('❌ Failed to capture quiz flow:', error.message);
  }
  
  await desktopContext.close();
  await mobileContext.close();
  await tabletContext.close();
  await browser.close();
  
  console.log('🎉 All screenshots captured successfully!');
  console.log('📁 Screenshots saved in docs/design-docs/screenshots/');
}

captureScreenshots().catch(console.error);