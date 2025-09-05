#!/usr/bin/env node
/* Simple performance collector using Playwright
   Collects navigation timings and FCP for key routes across three viewports.
*/
const { chromium } = require('playwright');

const routes = ['/', '/start', '/quiz/technology', '/profile', '/leaderboard', '/about', '/privacy'];
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1200, height: 800 },
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const results = [];

  for (const vp of viewports) {
    const page = await context.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const route of routes) {
      const url = `http://localhost:3000${route}`;
      const start = Date.now();
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        // Allow some idle time for late paints
        await page.waitForTimeout(1500);
        const metrics = await page.evaluate(() => {
          const nav = performance.getEntriesByType('navigation')[0];
          const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
          return {
            title: document.title,
            navTiming: nav ? {
              duration: nav.duration,
              domContentLoaded: nav.domContentLoadedEventEnd,
              loadEventEnd: nav.loadEventEnd,
              transferSize: nav.transferSize,
            } : null,
            fcp: fcpEntry ? fcpEntry.startTime : null,
            consoleErrors: [],
          };
        });
        results.push({ route, viewport: vp.name, ok: true, ms: Date.now() - start, ...metrics });
      } catch (e) {
        results.push({ route, viewport: vp.name, ok: false, error: String(e), ms: Date.now() - start });
      }
    }
    await page.close();
  }
  await browser.close();
  const fs = require('fs');
  fs.mkdirSync('performance-results', { recursive: true });
  fs.writeFileSync('performance-results/metrics.json', JSON.stringify(results, null, 2));
  console.log('Wrote performance-results/metrics.json with', results.length, 'entries');
})();

