// @ts-check
const { chromium } = require('playwright');
const fs = require('fs').promises;

async function generateBaselines() {
  console.log('🔍 Generating baseline images for TechKwiz...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Define viewports
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 }
  ];
  
  // Define pages to capture
  const pages = [
    { path: '/', name: 'homepage' },
    { path: '/start', name: 'start-page' },
    { path: '/profile', name: 'profile-page' },
    { path: '/leaderboard', name: 'leaderboard' },
    { path: '/quiz/swipe-personality', name: 'quiz-page' }
  ];
  
  // Create baselines directory if it doesn't exist
  await fs.mkdir('./baselines', { recursive: true });
  
  for (const viewport of viewports) {
    console.log(`📱 Generating baselines for ${viewport.name}...`);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    
    for (const pageDef of pages) {
      try {
        console.log(`  📄 Capturing ${pageDef.name}...`);
        await page.goto(`http://localhost:3000${pageDef.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000); // Wait for animations
        
        const filename = `./baselines/${pageDef.name}-${viewport.name}.png`;
        await page.screenshot({ path: filename, fullPage: true });
        console.log(`    ✅ Saved ${filename}`);
      } catch (error) {
        console.log(`    ❌ Failed to capture ${pageDef.name}: ${error.message}`);
      }
    }
  }
  
  await browser.close();
  console.log('✅ Baseline generation complete!');
}

// Run if this file is executed directly
if (require.main === module) {
  generateBaselines().catch(console.error);
}

module.exports = { generateBaselines };