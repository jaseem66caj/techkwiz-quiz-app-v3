const puppeteer = require('puppeteer');

async function check404Errors() {
    console.log('🔍 Checking for 404 Errors...');
    
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    const failedRequests = [];
    const allRequests = [];
    
    page.on('requestfailed', request => {
        failedRequests.push({
            url: request.url(),
            method: request.method(),
            failure: request.failure().errorText,
            timestamp: new Date().toISOString()
        });
        console.log(`❌ FAILED: ${request.url()} - ${request.failure().errorText}`);
    });
    
    page.on('response', response => {
        allRequests.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText()
        });
        
        if (response.status() === 404) {
            console.log(`🚨 404 ERROR: ${response.url()}`);
        } else if (response.status() >= 400) {
            console.log(`⚠️  ERROR ${response.status()}: ${response.url()}`);
        }
    });
    
    try {
        console.log('\n📱 Testing Local Site...');
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n📊 Local Site Results:');
        console.log(`Total Requests: ${allRequests.length}`);
        console.log(`Failed Requests: ${failedRequests.length}`);
        
        const localErrors = allRequests.filter(req => req.status >= 400);
        if (localErrors.length > 0) {
            console.log('\n🚨 Local Errors Found:');
            localErrors.forEach(error => {
                console.log(`  ${error.status}: ${error.url}`);
            });
        } else {
            console.log('✅ No errors found locally');
        }
        
        // Reset arrays for live site test
        failedRequests.length = 0;
        allRequests.length = 0;
        
        console.log('\n🌐 Testing Live Site...');
        await page.goto('https://play.techkwiz.com/', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n📊 Live Site Results:');
        console.log(`Total Requests: ${allRequests.length}`);
        console.log(`Failed Requests: ${failedRequests.length}`);
        
        const liveErrors = allRequests.filter(req => req.status >= 400);
        if (liveErrors.length > 0) {
            console.log('\n🚨 Live Site Errors Found:');
            liveErrors.forEach(error => {
                console.log(`  ${error.status}: ${error.url}`);
            });
        } else {
            console.log('✅ No errors found on live site');
        }
        
        // Test navigation on live site
        console.log('\n🔗 Testing Live Site Navigation...');
        try {
            await page.goto('https://play.techkwiz.com/start', { 
                waitUntil: 'networkidle2',
                timeout: 15000 
            });
            console.log('✅ /start route loaded successfully');
            
            const startPageErrors = allRequests.filter(req => req.status >= 400);
            if (startPageErrors.length > 0) {
                console.log('🚨 Errors on /start page:');
                startPageErrors.forEach(error => {
                    console.log(`  ${error.status}: ${error.url}`);
                });
            }
            
        } catch (navError) {
            console.log(`❌ Navigation to /start failed: ${navError.message}`);
        }
        
        // Summary
        console.log('\n📋 SUMMARY:');
        console.log('The 404 errors are likely from:');
        console.log('1. Missing favicon or other static assets');
        console.log('2. Analytics or tracking scripts');
        console.log('3. Font loading issues');
        console.log('4. API endpoints that don\'t exist');
        
    } catch (error) {
        console.error('❌ Check failed:', error.message);
    } finally {
        await browser.close();
    }
}

check404Errors().catch(console.error);
