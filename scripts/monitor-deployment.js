const puppeteer = require('puppeteer');

async function monitorDeployment() {
    console.log('🔍 Monitoring Live Deployment for Issues...');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const errors = [];
    const warnings = [];
    const networkIssues = [];
    
    // Monitor console messages
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`CONSOLE ERROR: ${msg.text()}`);
        } else if (msg.type() === 'warn') {
            warnings.push(`CONSOLE WARNING: ${msg.text()}`);
        }
    });
    
    // Monitor page errors
    page.on('pageerror', error => {
        errors.push(`PAGE ERROR: ${error.message}`);
    });
    
    // Monitor network failures
    page.on('requestfailed', request => {
        networkIssues.push(`NETWORK FAILURE: ${request.url()} - ${request.failure().errorText}`);
    });
    
    try {
        console.log('🌐 Loading live site for monitoring...');
        await page.goto('https://play.techkwiz.com/', { waitUntil: 'networkidle2', timeout: 20000 });
        
        // Wait and monitor for 10 seconds
        console.log('⏱️  Monitoring for 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Test user interactions
        console.log('🖱️  Testing user interactions...');
        
        // Try clicking quiz buttons
        const buttons = await page.$$('button');
        if (buttons.length > 0) {
            await buttons[0].click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if quiz progressed
            const progressChanged = await page.evaluate(() => {
                return document.body.textContent.includes('2/5') || 
                       document.body.textContent.includes('Quiz Completed');
            });
            
            if (progressChanged) {
                console.log('✅ Quiz progression working correctly');
            } else {
                warnings.push('Quiz progression may not be working as expected');
            }
        }
        
        // Test navigation
        console.log('🔗 Testing navigation...');
        try {
            await page.goto('https://play.techkwiz.com/api/health', { timeout: 5000 });
            const healthResponse = await page.content();
            if (healthResponse.includes('"status":"ok"')) {
                console.log('✅ API health endpoint working');
            } else {
                errors.push('API health endpoint not responding correctly');
            }
        } catch (e) {
            errors.push(`API health endpoint failed: ${e.message}`);
        }
        
        // Check for performance issues
        console.log('⚡ Checking performance...');
        const performanceMetrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            return {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
            };
        });
        
        console.log(`📊 Performance Metrics:`);
        console.log(`   Load Time: ${Math.round(performanceMetrics.loadTime)}ms`);
        console.log(`   DOM Content Loaded: ${Math.round(performanceMetrics.domContentLoaded)}ms`);
        console.log(`   First Paint: ${Math.round(performanceMetrics.firstPaint)}ms`);
        
        if (performanceMetrics.loadTime > 5000) {
            warnings.push(`Slow load time: ${Math.round(performanceMetrics.loadTime)}ms`);
        }
        
        // Final monitoring report
        console.log('\n📋 DEPLOYMENT MONITORING REPORT:');
        console.log('================================');
        
        console.log(`🚨 Errors Found: ${errors.length}`);
        if (errors.length > 0) {
            errors.forEach((error, i) => {
                console.log(`   ${i + 1}. ${error}`);
            });
        }
        
        console.log(`⚠️  Warnings Found: ${warnings.length}`);
        if (warnings.length > 0) {
            warnings.forEach((warning, i) => {
                console.log(`   ${i + 1}. ${warning}`);
            });
        }
        
        console.log(`🌐 Network Issues: ${networkIssues.length}`);
        if (networkIssues.length > 0) {
            networkIssues.forEach((issue, i) => {
                console.log(`   ${i + 1}. ${issue}`);
            });
        }
        
        // Overall health assessment
        console.log('\n🎯 DEPLOYMENT HEALTH ASSESSMENT:');
        if (errors.length === 0 && warnings.length <= 2) {
            console.log('🟢 EXCELLENT - Deployment is stable with no critical issues');
        } else if (errors.length <= 1 && warnings.length <= 5) {
            console.log('🟡 GOOD - Deployment is functional with minor issues');
        } else {
            console.log('🔴 ATTENTION NEEDED - Multiple issues detected');
        }
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        if (errors.length === 0 && warnings.length === 0) {
            console.log('✅ No action required - deployment is performing excellently');
        } else {
            console.log('📝 Consider monitoring the following:');
            if (errors.length > 0) {
                console.log('   - Investigate and fix critical errors');
            }
            if (warnings.length > 3) {
                console.log('   - Review warnings for potential improvements');
            }
            if (networkIssues.length > 0) {
                console.log('   - Check network connectivity and resource availability');
            }
        }
        
        console.log('\n🎉 MONITORING COMPLETE');
        
    } catch (error) {
        console.error('❌ Monitoring failed:', error.message);
        errors.push(`Monitoring script error: ${error.message}`);
    } finally {
        await browser.close();
    }
}

monitorDeployment().catch(console.error);
