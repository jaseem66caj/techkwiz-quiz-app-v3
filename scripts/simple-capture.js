const { chromium } = require('playwright');
const fs = require('fs').promises;

async function captureScreenshots() {
  console.log('🚀 Starting simple website screenshot capture...');
  
  // Create directories if they don't exist
  await fs.mkdir('docs/design-docs/screenshots/desktop', { recursive: true });
  
  const browser = await chromium.launch();
  
  // Desktop viewport
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  const pages = [
    { path: '/', name: 'homepage' },
    { path: '/start', name: 'start-page' },
    { path: '/profile', name: 'profile-page' }
  ];
  
  // Capture screenshots
  console.log('🖥️ Capturing screenshots...');
  for (const p of pages) {
    try {
      console.log(`📸 Capturing ${p.name}`);
      await page.goto(`http://localhost:3002${p.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000); // Wait for animations
      await page.screenshot({ 
        path: `docs/design-docs/screenshots/desktop/${p.name}.png`,
        fullPage: true 
      });
      console.log(`✅ Saved ${p.name}.png`);
    } catch (error) {
      console.error(`❌ Failed to capture ${p.name}:`, error.message);
    }
  }
  
  await context.close();
  await browser.close();
  
  console.log('🎉 Screenshots captured successfully!');
}

captureScreenshots().catch(console.error);