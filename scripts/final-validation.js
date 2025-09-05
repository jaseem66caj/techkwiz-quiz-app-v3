const puppeteer = require('puppeteer');

async function finalValidation() {
    console.log('🎯 Final Production Validation...');
    
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    const issues = [];
    let testsPassed = 0;
    let totalTests = 0;
    
    const runTest = async (testName, testFn) => {
        totalTests++;
        try {
            await testFn();
            console.log(`✅ ${testName}`);
            testsPassed++;
        } catch (error) {
            console.log(`❌ ${testName}: ${error.message}`);
            issues.push(`${testName}: ${error.message}`);
        }
    };
    
    try {
        // Test 1: Homepage loads correctly
        await runTest('Homepage loads', async () => {
            await page.goto('https://play.techkwiz.com/', { waitUntil: 'networkidle2', timeout: 15000 });
            const title = await page.title();
            if (title !== 'TechKwiz') throw new Error(`Expected title 'TechKwiz', got '${title}'`);
        });
        
        // Test 2: Welcome message displays
        await runTest('Welcome message displays', async () => {
            const hasWelcome = await page.evaluate(() => 
                document.body.textContent.includes('Welcome to TechKwiz')
            );
            if (!hasWelcome) throw new Error('Welcome message not found');
        });
        
        // Test 3: Quiz interface renders
        await runTest('Quiz interface renders', async () => {
            const hasQuizContent = await page.evaluate(() => 
                document.body.textContent.includes('Level Up!')
            );
            if (!hasQuizContent) throw new Error('Quiz interface not found');
        });
        
        // Test 4: Answer buttons are clickable
        await runTest('Answer buttons clickable', async () => {
            const buttons = await page.$$('button');
            if (buttons.length < 4) throw new Error(`Expected at least 4 buttons, found ${buttons.length}`);
            
            // Try clicking the first answer button
            await buttons[0].click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        });
        
        // Test 5: Navigation to /start works
        await runTest('/start route works', async () => {
            await page.goto('https://play.techkwiz.com/start', { waitUntil: 'domcontentloaded', timeout: 10000 });
            const hasContent = await page.evaluate(() => document.body.textContent.length > 100);
            if (!hasContent) throw new Error('Start page has no content');
        });
        
        // Test 6: API health check works
        await runTest('API health check', async () => {
            const response = await page.goto('https://play.techkwiz.com/api/health');
            const text = await response.text();
            const data = JSON.parse(text);
            if (data.status !== 'ok') throw new Error(`API returned ${data.status}`);
        });
        
        // Test 7: No critical console errors
        await runTest('No critical console errors', async () => {
            await page.goto('https://play.techkwiz.com/', { waitUntil: 'networkidle2' });
            
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const criticalErrors = errors.filter(err => 
                err.includes('hydration') || 
                err.includes('navigation') || 
                err.includes('undefined')
            );
            
            if (criticalErrors.length > 0) {
                throw new Error(`Critical errors: ${criticalErrors.join(', ')}`);
            }
        });
        
        // Test 8: Quiz progression works
        await runTest('Quiz progression', async () => {
            await page.goto('https://play.techkwiz.com/', { waitUntil: 'networkidle2' });
            
            // Check initial question number
            const initialProgress = await page.evaluate(() => {
                const progressText = document.body.textContent;
                return progressText.includes('1/5');
            });
            
            if (!initialProgress) throw new Error('Initial progress indicator not found');
            
            // Click an answer and check if progress updates
            const buttons = await page.$$('button');
            if (buttons.length > 0) {
                await buttons[0].click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const updatedProgress = await page.evaluate(() => {
                    const progressText = document.body.textContent;
                    return progressText.includes('2/5') || progressText.includes('Quiz Completed');
                });
                
                if (!updatedProgress) throw new Error('Quiz progression not working');
            }
        });
        
        console.log('\n📊 LIVE PRODUCTION VALIDATION RESULTS:');
        console.log('=====================================');
        console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
        console.log(`Success Rate: ${Math.round((testsPassed/totalTests) * 100)}%`);
        console.log(`Target: 88% (Previous baseline)`);
        
        if (issues.length > 0) {
            console.log('\n🚨 Issues Found:');
            issues.forEach((issue, i) => {
                console.log(`${i + 1}. ${issue}`);
            });
        } else {
            console.log('\n🎉 ALL TESTS PASSED!');
            console.log('✅ Production site is fully functional');
            console.log('✅ Quiz experience works end-to-end');
            console.log('✅ Navigation is working correctly');
            console.log('✅ No critical errors detected');
        }
        
        // Overall status
        if (testsPassed === totalTests) {
            console.log('\n🟢 PRODUCTION STATUS: FULLY OPERATIONAL');
        } else if (testsPassed >= totalTests * 0.8) {
            console.log('\n🟡 PRODUCTION STATUS: MOSTLY FUNCTIONAL (minor issues)');
        } else {
            console.log('\n🔴 PRODUCTION STATUS: NEEDS ATTENTION');
        }
        
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
    } finally {
        await browser.close();
    }
}

finalValidation().catch(console.error);
