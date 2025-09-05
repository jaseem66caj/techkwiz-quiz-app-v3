// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Performance and Visual Validation Tests for Techkwiz-v8
 * Phase 6: Performance Metrics Collection and Visual Regression Testing
 */

test.describe('Performance and Visual Validation - Techkwiz-v8', () => {
  
  // Phase 6: Performance Metrics Collection
  test.describe('Phase 6: Performance Metrics Collection', () => {
    
    const routes = [
      { path: '/', name: 'Homepage' },
      { path: '/start', name: 'Category Selection' },
      { path: '/profile', name: 'User Profile' },
      { path: '/leaderboard', name: 'Leaderboard' },
      { path: '/about', name: 'About Page' },
      { path: '/privacy', name: 'Privacy Policy' },
      { path: '/quiz/movies', name: 'Movies Quiz' }
    ];

    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1200, height: 800 }
    ];

    for (const route of routes) {
      for (const viewport of viewports) {
        test(`Performance: ${route.name} - ${viewport.name}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          
          // Start performance measurement
          const startTime = Date.now();
          
          // Navigate and measure First Contentful Paint
          await page.goto(route.path, { waitUntil: 'networkidle', timeout: 15000 });
          
          const loadTime = Date.now() - startTime;
          
          // Measure performance metrics
          const performanceMetrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            
            return {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
              firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
              firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0
            };
          });
          
          // Performance targets
          const targets = {
            fcp: 3000, // First Contentful Paint < 3 seconds
            tti: 4000, // Time to Interactive < 4 seconds (for homepage)
            totalLoad: 10000 // Total load time < 10 seconds
          };
          
          // Validate performance
          expect(loadTime).toBeLessThan(targets.totalLoad);
          
          if (performanceMetrics.firstContentfulPaint > 0) {
            expect(performanceMetrics.firstContentfulPaint).toBeLessThan(targets.fcp);
          }
          
          // Special check for homepage quiz interactivity
          if (route.path === '/') {
            await page.waitForTimeout(2000); // Allow for React hydration
            
            const quizInterface = page.locator('.quiz-interface, [data-testid="quiz-interface"]');
            if (await quizInterface.count() > 0) {
              const interactiveTime = Date.now() - startTime;
              expect(interactiveTime).toBeLessThan(targets.tti);
            }
          }
          
          console.log(`📊 ${route.name} - ${viewport.name}:`);
          console.log(`   Load Time: ${loadTime}ms`);
          console.log(`   FCP: ${performanceMetrics.firstContentfulPaint}ms`);
          console.log(`   DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
        });
      }
    }

    test('Bundle Size and Resource Loading Analysis', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Analyze network requests
      const requests = [];
      page.on('request', request => {
        requests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType()
        });
      });
      
      const responses = [];
      page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          size: response.headers()['content-length'] || 0
        });
      });
      
      await page.reload({ waitUntil: 'networkidle' });
      
      // Analyze JavaScript bundles
      const jsRequests = requests.filter(req => req.resourceType === 'script');
      const cssRequests = requests.filter(req => req.resourceType === 'stylesheet');
      
      console.log(`📦 Resource Analysis:`);
      console.log(`   JavaScript files: ${jsRequests.length}`);
      console.log(`   CSS files: ${cssRequests.length}`);
      console.log(`   Total requests: ${requests.length}`);
      
      // Verify no failed requests
      const failedResponses = responses.filter(res => res.status >= 400);
      expect(failedResponses).toHaveLength(0);
    });
  });

  // Phase 7: Visual Regression Testing
  test.describe('Phase 7: Visual Regression Testing', () => {
    
    const routes = [
      { path: '/', name: 'homepage' },
      { path: '/start', name: 'category-selection' },
      { path: '/profile', name: 'profile' },
      { path: '/leaderboard', name: 'leaderboard' },
      { path: '/about', name: 'about' },
      { path: '/privacy', name: 'privacy' }
    ];

    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1200, height: 800 }
    ];

    for (const route of routes) {
      for (const viewport of viewports) {
        test(`Visual: ${route.name} - ${viewport.name}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          
          // Navigate to route
          await page.goto(route.path, { waitUntil: 'networkidle' });
          
          // Wait for animations and content to settle
          await page.waitForTimeout(3000);
          
          // Hide dynamic elements that might cause flaky tests
          await page.addStyleTag({
            content: `
              .timer, .countdown, [data-testid="timer"] { visibility: hidden !important; }
              .loading, .spinner { visibility: hidden !important; }
              .animation, .animate { animation: none !important; }
            `
          });
          
          // Take screenshot
          await expect(page).toHaveScreenshot(`${route.name}-${viewport.name}.png`, {
            fullPage: true,
            maxDiffPixelRatio: 0.02,
            threshold: 0.2
          });
          
          console.log(`📸 Screenshot captured: ${route.name}-${viewport.name}`);
        });
      }
    }

    test('Visual Consistency - Responsive Design', async ({ page }) => {
      const breakpoints = [
        { width: 320, height: 568, name: 'small-mobile' },
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1024, height: 768, name: 'tablet-landscape' },
        { width: 1200, height: 800, name: 'desktop' },
        { width: 1920, height: 1080, name: 'large-desktop' }
      ];

      for (const breakpoint of breakpoints) {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
        await page.goto('/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Check for layout consistency
        const navigation = page.locator('nav');
        await expect(navigation).toBeVisible();
        
        // Verify no horizontal scrollbars on mobile
        if (breakpoint.width < 768) {
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
          const viewportWidth = breakpoint.width;
          expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
        }
        
        // Check for readable text
        const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span');
        const textCount = await textElements.count();
        if (textCount > 0) {
          const fontSize = await textElements.first().evaluate(el => 
            window.getComputedStyle(el).fontSize
          );
          const fontSizeNum = parseInt(fontSize);
          expect(fontSizeNum).toBeGreaterThan(12); // Minimum readable font size
        }
        
        console.log(`✅ Responsive check passed: ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
      }
    });

    test('Animation and Transition Validation', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Test Framer Motion animations
      const animatedElements = page.locator('[style*="transform"], .motion-element, [class*="animate"]');
      const animatedCount = await animatedElements.count();
      
      if (animatedCount > 0) {
        console.log(`🎬 Found ${animatedCount} animated elements`);
        
        // Verify animations don't cause layout shifts
        const initialLayout = await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          return Array.from(elements).map(el => ({
            tag: el.tagName,
            rect: el.getBoundingClientRect()
          }));
        });
        
        await page.waitForTimeout(2000); // Wait for animations
        
        const finalLayout = await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          return Array.from(elements).map(el => ({
            tag: el.tagName,
            rect: el.getBoundingClientRect()
          }));
        });
        
        // Check for significant layout shifts (CLS)
        let significantShifts = 0;
        for (let i = 0; i < Math.min(initialLayout.length, finalLayout.length); i++) {
          const initial = initialLayout[i];
          const final = finalLayout[i];
          
          if (initial.tag === final.tag) {
            const xShift = Math.abs(initial.rect.x - final.rect.x);
            const yShift = Math.abs(initial.rect.y - final.rect.y);
            
            if (xShift > 5 || yShift > 5) { // 5px tolerance
              significantShifts++;
            }
          }
        }
        
        // Allow some layout shifts for intentional animations
        expect(significantShifts).toBeLessThan(initialLayout.length * 0.1); // Less than 10% of elements
      }
    });

    test('Font Loading and Styling Validation', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      // Check Inter font loading
      const fontFamilies = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const fonts = new Set();
        
        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          fonts.add(style.fontFamily);
        });
        
        return Array.from(fonts);
      });
      
      const hasInterFont = fontFamilies.some(font => font.includes('Inter'));
      expect(hasInterFont).toBe(true);
      
      // Check for gradient backgrounds
      const gradientElements = await page.locator('[class*="gradient"], [style*="gradient"]').count();
      console.log(`🎨 Found ${gradientElements} elements with gradients`);
      
      // Verify Tailwind CSS classes are applied
      const tailwindClasses = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let tailwindCount = 0;
        
        elements.forEach(el => {
          const classes = el.className;
          if (typeof classes === 'string' && 
              (classes.includes('bg-') || classes.includes('text-') || 
               classes.includes('p-') || classes.includes('m-'))) {
            tailwindCount++;
          }
        });
        
        return tailwindCount;
      });
      
      expect(tailwindCount).toBeGreaterThan(0);
      console.log(`🎯 Found ${tailwindCount} elements with Tailwind classes`);
    });
  });
});
