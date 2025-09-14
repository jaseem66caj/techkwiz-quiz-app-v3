#!/usr/bin/env node

/**
 * Script to update design documentation screenshots
 * 
 * This script captures screenshots of all main pages of the TechKwiz application
 * for design documentation purposes. It captures views for desktop, tablet, and
 * mobile screen sizes.
 * 
 * Usage:
 *   node scripts/update-design-screenshots.js
 * 
 * Requirements:
 *   - The application must be running on http://localhost:3002
 *   - Playwright must be installed
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function captureScreenshots() {
  console.log('🚀 Starting design screenshot update...');
  
  // Ensure directories exist
  const screenshotDirs = [
    'docs/design-docs/screenshots/desktop',
    'docs/design-docs/screenshots/mobile',
    'docs/design-docs/screenshots/tablet'
  ];
  
  for (const dir of screenshotDirs) {
    await fs.mkdir(dir, { recursive: true });
  }
  
  const browser = await chromium.launch();
  
  try {
    // Define viewports
    const viewports = {
      desktop: { width: 1280, height: 800 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 667 }
    };
    
    // Define pages to capture
    const pages = [
      { path: '/', name: 'homepage' },
      { path: '/start', name: 'start-page' },
      { path: '/profile', name: 'profile-page' },
      { path: '/leaderboard', name: 'leaderboard-page' },
      { path: '/about', name: 'about-page' },
      { path: '/privacy', name: 'privacy-page' }
    ];
    
    // Capture screenshots for each viewport
    for (const [viewportName, viewport] of Object.entries(viewports)) {
      console.log(`🖥️  Capturing ${viewportName} screenshots...`);
      
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      
      for (const p of pages) {
        try {
          console.log(`📸 Capturing ${p.name} (${viewportName})`);
          await page.goto(`http://localhost:3002${p.path}`, { 
            waitUntil: 'networkidle',
            timeout: 30000
          });
          
          // Wait for page to load completely
          await page.waitForTimeout(3000);
          
          // Handle any loading states
          try {
            await page.waitForSelector('[data-testid="loading"]', { 
              state: 'detached', 
              timeout: 5000 
            });
          } catch (e) {
            // If loading indicator doesn't disappear, continue anyway
            console.log(`⚠️  Loading state timeout for ${p.name}, continuing...`);
          }
          
          const screenshotPath = `docs/design-docs/screenshots/${viewportName}/${p.name}.png`;
          await page.screenshot({ 
            path: screenshotPath,
            fullPage: true 
          });
          
          console.log(`✅ Saved ${screenshotPath}`);
        } catch (error) {
          console.error(`❌ Failed to capture ${p.name} (${viewportName}):`, error.message);
        }
      }
      
      await context.close();
    }
    
    console.log('🎉 All screenshots updated successfully!');
    console.log('📁 Screenshots saved in docs/design-docs/screenshots/');
    
    // Update the documentation timestamp
    const designOverviewPath = 'docs/design-docs/DESIGN_OVERVIEW.md';
    try {
      const content = await fs.readFile(designOverviewPath, 'utf8');
      const timestamp = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const updatedContent = content.replace(
        /This documentation represents the current state of the application as of.*$/,
        `This documentation represents the current state of the application as of ${timestamp}.`
      );
      
      await fs.writeFile(designOverviewPath, updatedContent);
      console.log(`📝 Updated documentation timestamp to ${timestamp}`);
    } catch (error) {
      console.error('❌ Failed to update documentation timestamp:', error.message);
    }
    
  } catch (error) {
    console.error('💥 Fatal error during screenshot capture:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the script
if (require.main === module) {
  captureScreenshots().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { captureScreenshots };