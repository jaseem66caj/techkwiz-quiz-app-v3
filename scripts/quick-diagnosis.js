const puppeteer = require('puppeteer');

async function quickDiagnosis() {
    console.log('🔍 Quick Live Site Diagnosis...');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Capture console messages and errors
    const issues = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            issues.push(`CONSOLE ERROR: ${msg.text()}`);
        }
    });
    
    page.on('pageerror', error => {
        issues.push(`PAGE ERROR: ${error.message}`);
    });
    
    page.on('requestfailed', request => {
        issues.push(`NETWORK FAILURE: ${request.url()} - ${request.failure().errorText}`);
    });
    
    try {
        // Test homepage
        console.log('📱 Testing Homepage...');
        await page.goto('https://play.techkwiz.com/', { waitUntil: 'networkidle2' });
        
        const title = await page.title();
        console.log(`✅ Title: ${title}`);
        
        // Get page content
        const bodyText = await page.evaluate(() => document.body.textContent);
        console.log(`📄 Page loaded, content length: ${bodyText.length} characters`);
        
        // Look for navigation elements
        const buttons = await page.evaluate(() => {
            const allButtons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
            return allButtons.map(btn => ({
                tag: btn.tagName,
                text: btn.textContent?.trim().substring(0, 50),
                href: btn.href || null,
                className: btn.className,
                id: btn.id
            }));
        });
        
        console.log(`🔍 Found ${buttons.length} clickable elements:`);
        buttons.slice(0, 10).forEach((btn, i) => {
            console.log(`  ${i + 1}. ${btn.tag}: "${btn.text}" (class: ${btn.className})`);
        });
        
        // Test key routes
        const routes = ['/start', '/quiz/programming', '/profile'];
        for (const route of routes) {
            try {
                console.log(`\n📍 Testing ${route}...`);
                await page.goto(`https://play.techkwiz.com${route}`, { waitUntil: 'networkidle2', timeout: 10000 });
                const routeTitle = await page.title();
                const url = page.url();
                console.log(`  Title: ${routeTitle}`);
                console.log(`  Final URL: ${url}`);
                
                // Check for error indicators
                const hasError = await page.evaluate(() => {
                    const text = document.body.textContent.toLowerCase();
                    return text.includes('404') || text.includes('not found') || text.includes('error');
                });
                
                if (hasError) {
                    console.log(`  ❌ Route shows error page`);
                } else {
                    console.log(`  ✅ Route loaded successfully`);
                }
                
            } catch (routeError) {
                console.log(`  ❌ Route failed: ${routeError.message}`);
            }
        }
        
        // Print all issues found
        if (issues.length > 0) {
            console.log('\n🚨 ISSUES FOUND:');
            issues.forEach((issue, i) => {
                console.log(`${i + 1}. ${issue}`);
            });
        } else {
            console.log('\n✅ No critical issues detected');
        }
        
    } catch (error) {
        console.error('❌ Diagnosis failed:', error.message);
    } finally {
        await browser.close();
    }
}

quickDiagnosis().catch(console.error);
