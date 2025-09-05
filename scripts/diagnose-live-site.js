const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function diagnoseLiveSite() {
    console.log('🔍 Starting Live Site Diagnostic Analysis...');
    console.log('Target: https://play.techkwiz.com/');
    
    const browser = await puppeteer.launch({
        headless: false, // Show browser for debugging
        devtools: true,  // Open DevTools
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set up console logging
    const consoleMessages = [];
    const errors = [];
    const networkFailures = [];
    
    page.on('console', msg => {
        const message = {
            type: msg.type(),
            text: msg.text(),
            location: msg.location(),
            timestamp: new Date().toISOString()
        };
        consoleMessages.push(message);
        console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        };
        errors.push(errorInfo);
        console.log(`[PAGE ERROR] ${error.message}`);
    });
    
    page.on('requestfailed', request => {
        const failureInfo = {
            url: request.url(),
            method: request.method(),
            failure: request.failure().errorText,
            timestamp: new Date().toISOString()
        };
        networkFailures.push(failureInfo);
        console.log(`[NETWORK FAILURE] ${request.url()} - ${request.failure().errorText}`);
    });
    
    try {
        console.log('\n📱 Step 1: Loading Homepage...');
        await page.goto('https://play.techkwiz.com/', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Wait for page to fully load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Take screenshot of homepage
        await page.screenshot({ 
            path: 'diagnostic-homepage.png',
            fullPage: true 
        });
        console.log('✅ Homepage screenshot saved');
        
        // Check if page loaded correctly
        const title = await page.title();
        console.log(`📄 Page Title: ${title}`);
        
        // Look for navigation elements
        console.log('\n🔍 Step 2: Checking Navigation Elements...');
        
        // Look for start button with multiple selectors
        let startButton = await page.$('[data-testid="start-quiz-button"]');
        if (!startButton) startButton = await page.$('.start-button');
        if (!startButton) startButton = await page.$('button[class*="start"]');
        if (!startButton) startButton = await page.$('a[href*="start"]');
        if (!startButton) {
            // Look for any button with "start" text
            startButton = await page.evaluateHandle(() => {
                const buttons = Array.from(document.querySelectorAll('button, a'));
                return buttons.find(btn => btn.textContent?.toLowerCase().includes('start'));
            });
            if (startButton.asElement) startButton = startButton.asElement();
        }
        if (startButton) {
            console.log('✅ Start button found');
            
            // Try to click the start button
            console.log('🖱️  Attempting to click start button...');
            try {
                await startButton.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const currentUrl = page.url();
                console.log(`📍 Current URL after click: ${currentUrl}`);
                
                if (currentUrl.includes('start') || currentUrl.includes('quiz')) {
                    console.log('✅ Navigation successful');
                } else {
                    console.log('❌ Navigation failed - still on homepage');
                }
                
                // Take screenshot after navigation attempt
                await page.screenshot({ 
                    path: 'diagnostic-after-click.png',
                    fullPage: true 
                });
                
            } catch (clickError) {
                console.log(`❌ Click failed: ${clickError.message}`);
            }
        } else {
            console.log('❌ Start button not found');
            
            // Look for any clickable elements
            const buttons = await page.$$('button, a, [role="button"]');
            console.log(`🔍 Found ${buttons.length} clickable elements`);
            
            for (let i = 0; i < Math.min(buttons.length, 5); i++) {
                const text = await buttons[i].evaluate(el => el.textContent?.trim() || el.getAttribute('aria-label') || 'No text');
                console.log(`  - Button ${i + 1}: "${text}"`);
            }
        }
        
        // Test direct navigation to quiz routes
        console.log('\n🔍 Step 3: Testing Direct Route Navigation...');
        
        const testRoutes = [
            '/start',
            '/quiz/programming',
            '/quiz/javascript',
            '/profile',
            '/leaderboard'
        ];
        
        for (const route of testRoutes) {
            try {
                console.log(`📍 Testing route: ${route}`);
                await page.goto(`https://play.techkwiz.com${route}`, { 
                    waitUntil: 'networkidle2',
                    timeout: 15000 
                });
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const currentTitle = await page.title();
                const currentUrl = page.url();
                
                console.log(`  - Title: ${currentTitle}`);
                console.log(`  - Final URL: ${currentUrl}`);
                
                // Check for 404 or error pages
                const bodyText = await page.evaluate(() => document.body.textContent);
                if (bodyText.includes('404') || bodyText.includes('not found') || bodyText.includes('error')) {
                    console.log(`  ❌ Route appears to show error page`);
                } else {
                    console.log(`  ✅ Route loaded successfully`);
                }
                
            } catch (routeError) {
                console.log(`  ❌ Route failed: ${routeError.message}`);
            }
        }
        
        // Generate diagnostic report
        const report = {
            timestamp: new Date().toISOString(),
            site: 'https://play.techkwiz.com/',
            consoleMessages,
            errors,
            networkFailures,
            summary: {
                totalConsoleMessages: consoleMessages.length,
                totalErrors: errors.length,
                totalNetworkFailures: networkFailures.length,
                criticalIssues: errors.filter(e => e.message.includes('hydration') || e.message.includes('navigation')).length
            }
        };
        
        // Save report
        fs.writeFileSync('live-site-diagnostic-report.json', JSON.stringify(report, null, 2));
        console.log('\n📊 Diagnostic report saved to: live-site-diagnostic-report.json');
        
        // Print summary
        console.log('\n📋 DIAGNOSTIC SUMMARY:');
        console.log(`- Console Messages: ${consoleMessages.length}`);
        console.log(`- JavaScript Errors: ${errors.length}`);
        console.log(`- Network Failures: ${networkFailures.length}`);
        
        if (errors.length > 0) {
            console.log('\n🚨 CRITICAL ERRORS FOUND:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.message}`);
            });
        }
        
        if (networkFailures.length > 0) {
            console.log('\n🌐 NETWORK FAILURES:');
            networkFailures.forEach((failure, index) => {
                console.log(`${index + 1}. ${failure.url} - ${failure.failure}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Diagnostic failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the diagnostic
diagnoseLiveSite().catch(console.error);
