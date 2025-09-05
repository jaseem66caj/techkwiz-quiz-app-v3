const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROUTES = [
  { path: '/', name: 'homepage', description: 'Homepage with quiz functionality' },
  { path: '/start', name: 'start', description: 'Category selection (fixed redirect loop)' },
  { path: '/profile', name: 'profile', description: 'User profile (fixed redirect loop)' },
  { path: '/leaderboard', name: 'leaderboard', description: 'Rankings (fixed redirect loop)' },
  { path: '/about', name: 'about', description: 'Static content (SimpleNavigation)' },
  { path: '/privacy', name: 'privacy', description: 'Privacy policy (SimpleNavigation)' },
  { path: '/quiz/programming', name: 'quiz-programming', description: 'Dynamic quiz route' },
  { path: '/api/health', name: 'api-health', description: 'Health endpoint' }
];

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 }
];

const PERFORMANCE_TARGETS = {
  FCP: 3000, // First Contentful Paint < 3 seconds
  TTI: 4000, // Time to Interactive < 4 seconds
  CLS: 0.1   // Cumulative Layout Shift < 0.1
};

async function measurePerformance(page, url, routeName, viewport) {
  console.log(`📊 Measuring ${routeName} on ${viewport.name} (${viewport.width}x${viewport.height})`);
  
  try {
    // Set viewport
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    
    // Navigate and measure
    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Wait for performance observer to collect data
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          const paint = performance.getEntriesByType('paint');
          
          const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
          
          // Calculate TTI approximation (when main thread is idle)
          const tti = navigation ? navigation.loadEventEnd : 0;
          
          // Get CLS from layout shift entries
          let cls = 0;
          try {
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                  cls += entry.value;
                }
              }
            });
            observer.observe({ entryTypes: ['layout-shift'] });
          } catch (e) {
            // CLS not available in this browser
          }
          
          resolve({
            fcp: fcp ? fcp.startTime : 0,
            tti: tti,
            cls: cls,
            loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0
          });
        }, 2000);
      });
    });
    
    return {
      route: routeName,
      viewport: viewport.name,
      url: url,
      success: true,
      loadTime: loadTime,
      metrics: {
        fcp: Math.round(metrics.fcp),
        tti: Math.round(metrics.tti),
        cls: Math.round(metrics.cls * 1000) / 1000,
        loadTime: Math.round(metrics.loadTime)
      },
      targets: {
        fcpMet: metrics.fcp < PERFORMANCE_TARGETS.FCP,
        ttiMet: metrics.tti < PERFORMANCE_TARGETS.TTI,
        clsMet: metrics.cls < PERFORMANCE_TARGETS.CLS
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Error measuring ${routeName} on ${viewport.name}: ${error.message}`);
    return {
      route: routeName,
      viewport: viewport.name,
      url: url,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function generatePerformanceReport(results, outputDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(outputDir, `performance_report_${timestamp}.md`);
  
  // Calculate summary statistics
  const successfulResults = results.filter(r => r.success);
  const totalTests = results.length;
  const successfulTests = successfulResults.length;
  const successRate = Math.round((successfulTests / totalTests) * 100);
  
  // Calculate target achievement
  const targetsAchieved = successfulResults.filter(r => 
    r.targets.fcpMet && r.targets.ttiMet && r.targets.clsMet
  ).length;
  const targetAchievementRate = Math.round((targetsAchieved / successfulTests) * 100);
  
  // Generate detailed report
  let report = `# Performance Validation Report
**Generated:** ${new Date().toISOString()}
**Total Tests:** ${totalTests}
**Successful Tests:** ${successfulTests} (${successRate}%)
**Target Achievement Rate:** ${targetsAchieved}/${successfulTests} (${targetAchievementRate}%)

## Performance Targets
- **First Contentful Paint (FCP):** < ${PERFORMANCE_TARGETS.FCP}ms
- **Time to Interactive (TTI):** < ${PERFORMANCE_TARGETS.TTI}ms
- **Cumulative Layout Shift (CLS):** < ${PERFORMANCE_TARGETS.CLS}

## Detailed Results

| Route | Viewport | FCP (ms) | TTI (ms) | CLS | Load Time (ms) | Status |
|-------|----------|----------|----------|-----|----------------|--------|
`;

  successfulResults.forEach(result => {
    const fcpStatus = result.targets.fcpMet ? '✅' : '❌';
    const ttiStatus = result.targets.ttiMet ? '✅' : '❌';
    const clsStatus = result.targets.clsMet ? '✅' : '❌';
    const overallStatus = result.targets.fcpMet && result.targets.ttiMet && result.targets.clsMet ? '✅' : '❌';
    
    report += `| ${result.route} | ${result.viewport} | ${result.metrics.fcp} ${fcpStatus} | ${result.metrics.tti} ${ttiStatus} | ${result.metrics.cls} ${clsStatus} | ${result.metrics.loadTime} | ${overallStatus} |\n`;
  });
  
  // Add failed tests
  const failedResults = results.filter(r => !r.success);
  if (failedResults.length > 0) {
    report += `\n## Failed Tests\n\n`;
    failedResults.forEach(result => {
      report += `- **${result.route}** (${result.viewport}): ${result.error}\n`;
    });
  }
  
  // Add optimization recommendations
  report += `\n## Optimization Recommendations\n\n`;
  
  const slowFCP = successfulResults.filter(r => !r.targets.fcpMet);
  const slowTTI = successfulResults.filter(r => !r.targets.ttiMet);
  const highCLS = successfulResults.filter(r => !r.targets.clsMet);
  
  if (slowFCP.length > 0) {
    report += `### First Contentful Paint Issues\n`;
    slowFCP.forEach(r => {
      report += `- **${r.route}** (${r.viewport}): ${r.metrics.fcp}ms (target: <${PERFORMANCE_TARGETS.FCP}ms)\n`;
    });
    report += `\n**Recommendations:** Optimize critical rendering path, reduce blocking resources, implement resource hints.\n\n`;
  }
  
  if (slowTTI.length > 0) {
    report += `### Time to Interactive Issues\n`;
    slowTTI.forEach(r => {
      report += `- **${r.route}** (${r.viewport}): ${r.metrics.tti}ms (target: <${PERFORMANCE_TARGETS.TTI}ms)\n`;
    });
    report += `\n**Recommendations:** Reduce JavaScript bundle size, implement code splitting, optimize third-party scripts.\n\n`;
  }
  
  if (highCLS.length > 0) {
    report += `### Cumulative Layout Shift Issues\n`;
    highCLS.forEach(r => {
      report += `- **${r.route}** (${r.viewport}): ${r.metrics.cls} (target: <${PERFORMANCE_TARGETS.CLS})\n`;
    });
    report += `\n**Recommendations:** Reserve space for dynamic content, avoid inserting content above existing content, use transform animations.\n\n`;
  }
  
  // Write report
  fs.writeFileSync(reportPath, report);
  
  // Write JSON data
  const jsonPath = path.join(outputDir, `performance_data_${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  
  return { reportPath, jsonPath, summary: { successRate, targetAchievementRate, totalTests, successfulTests, targetsAchieved } };
}

async function main() {
  const outputDir = 'performance-results';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('🚀 Starting Performance Validation');
  console.log(`📊 Testing ${ROUTES.length} routes across ${VIEWPORTS.length} viewports (${ROUTES.length * VIEWPORTS.length} total tests)`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = [];
  
  for (const route of ROUTES) {
    for (const viewport of VIEWPORTS) {
      const url = `http://localhost:3000${route.path}`;
      const result = await measurePerformance(page, url, route.name, viewport);
      results.push(result);
      
      // Brief pause between tests
      await page.waitForTimeout(1000);
    }
  }
  
  await browser.close();
  
  console.log('📋 Generating performance report...');
  const report = await generatePerformanceReport(results, outputDir);
  
  console.log('✅ Performance validation completed');
  console.log(`📊 Success rate: ${report.summary.successRate}%`);
  console.log(`🎯 Target achievement: ${report.summary.targetAchievementRate}%`);
  console.log(`📄 Report: ${report.reportPath}`);
  console.log(`📊 Data: ${report.jsonPath}`);
  
  // Exit with appropriate code
  process.exit(report.summary.targetAchievementRate >= 75 ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { measurePerformance, generatePerformanceReport, ROUTES, VIEWPORTS, PERFORMANCE_TARGETS };
