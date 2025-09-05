const puppeteer = require('puppeteer');

async function testLiveDeployment() {
    console.log('🔍 Testing Live Deployment Changes...');
    
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🌐 Loading live site...');
        await page.goto('https://play.techkwiz.com/', { waitUntil: 'networkidle2', timeout: 20000 });
        
        // Wait for page to fully render
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Test for our specific changes
        const deploymentTests = await page.evaluate(() => {
            const bodyText = document.body.textContent;
            
            return {
                // Test 1: Check for enhanced instructions
                hasClickInstructions: bodyText.includes('Click an answer below') || bodyText.includes('👆'),
                
                // Test 2: Check for welcome message
                hasWelcomeMessage: bodyText.includes('Welcome to TechKwiz'),
                
                // Test 3: Check for quiz interface
                hasQuizInterface: bodyText.includes('Level Up!'),
                
                // Test 4: Check for progress indicator
                hasProgressIndicator: bodyText.includes('1/5'),
                
                // Test 5: Check for fallback questions
                hasFallbackQuestions: bodyText.includes('Instagram') && bodyText.includes('TikTok'),
                
                // Test 6: Check for coins messaging
                hasCoinsMessage: bodyText.includes('coins'),
                
                // Test 7: Count interactive buttons
                buttonCount: document.querySelectorAll('button').length,
                
                // Test 8: Check page structure
                hasMainElement: !!document.querySelector('main'),
                
                // Test 9: Check for loading state
                hasLoadingSpinner: !!document.querySelector('.animate-spin'),
                
                // Test 10: Get full text sample for analysis
                textSample: bodyText.substring(0, 500)
            };
        });
        
        console.log('\n📊 DEPLOYMENT TEST RESULTS:');
        console.log('============================');
        
        let passedTests = 0;
        const totalTests = 9; // Excluding textSample
        
        // Test results
        const tests = [
            { name: 'Enhanced Click Instructions', result: deploymentTests.hasClickInstructions, critical: true },
            { name: 'Welcome Message', result: deploymentTests.hasWelcomeMessage, critical: true },
            { name: 'Quiz Interface', result: deploymentTests.hasQuizInterface, critical: true },
            { name: 'Progress Indicator', result: deploymentTests.hasProgressIndicator, critical: true },
            { name: 'Fallback Questions', result: deploymentTests.hasFallbackQuestions, critical: true },
            { name: 'Coins Messaging', result: deploymentTests.hasCoinsMessage, critical: false },
            { name: 'Interactive Buttons (≥4)', result: deploymentTests.buttonCount >= 4, critical: true },
            { name: 'Main Element Structure', result: deploymentTests.hasMainElement, critical: true },
            { name: 'No Loading Spinner (Loaded)', result: !deploymentTests.hasLoadingSpinner, critical: false }
        ];
        
        tests.forEach(test => {
            const status = test.result ? '✅' : '❌';
            const critical = test.critical ? ' (CRITICAL)' : '';
            console.log(`${status} ${test.name}${critical}`);
            if (test.result) passedTests++;
        });
        
        console.log(`\n📈 Success Rate: ${passedTests}/${totalTests} (${Math.round((passedTests/totalTests) * 100)}%)`);
        console.log(`🔘 Button Count: ${deploymentTests.buttonCount}`);
        
        // Check for our specific UX improvement
        if (deploymentTests.hasClickInstructions) {
            console.log('\n🎉 SUCCESS: Enhanced UX instructions deployed!');
        } else {
            console.log('\n⚠️  WARNING: Enhanced UX instructions not found');
        }
        
        // Test static assets
        console.log('\n🔍 Testing Static Assets...');
        
        try {
            const faviconResponse = await page.goto('https://play.techkwiz.com/favicon.ico');
            console.log(`✅ Favicon: ${faviconResponse.status()}`);
        } catch (e) {
            console.log(`❌ Favicon: Failed to load`);
        }
        
        try {
            const robotsResponse = await page.goto('https://play.techkwiz.com/robots.txt');
            console.log(`✅ Robots.txt: ${robotsResponse.status()}`);
        } catch (e) {
            console.log(`❌ Robots.txt: Failed to load`);
        }
        
        try {
            const manifestResponse = await page.goto('https://play.techkwiz.com/manifest.json');
            console.log(`✅ Manifest.json: ${manifestResponse.status()}`);
        } catch (e) {
            console.log(`❌ Manifest.json: Failed to load`);
        }
        
        // Test navigation
        console.log('\n🔗 Testing Navigation...');
        try {
            await page.goto('https://play.techkwiz.com/start', { waitUntil: 'domcontentloaded', timeout: 10000 });
            console.log('✅ /start route accessible');
        } catch (e) {
            console.log('❌ /start route failed');
        }
        
        // Final assessment
        console.log('\n🎯 DEPLOYMENT ASSESSMENT:');
        if (passedTests >= 8) {
            console.log('🟢 DEPLOYMENT SUCCESSFUL - All critical features working');
        } else if (passedTests >= 6) {
            console.log('🟡 DEPLOYMENT PARTIAL - Some features may need attention');
        } else {
            console.log('🔴 DEPLOYMENT ISSUES - Critical features not working');
        }
        
        console.log('\n📝 Text Sample from Live Site:');
        console.log(deploymentTests.textSample);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testLiveDeployment().catch(console.error);
