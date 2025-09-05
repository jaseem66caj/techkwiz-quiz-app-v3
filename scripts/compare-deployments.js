const puppeteer = require('puppeteer');

async function compareDeployments() {
    console.log('🔍 Comparing Local vs Live Deployments...');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        // Test local version
        console.log('📱 Testing Local Version...');
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
        
        const localData = await page.evaluate(() => {
            return {
                title: document.title,
                hasWelcome: document.body.textContent.includes('Welcome to TechKwiz'),
                hasQuiz: document.body.textContent.includes('Level Up!'),
                buttonCount: document.querySelectorAll('button').length,
                scripts: Array.from(document.querySelectorAll('script')).map(s => s.src).filter(s => s),
                stylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href),
                bodyClasses: document.body.className,
                hasNavigation: !!document.querySelector('nav'),
                mainContent: document.querySelector('main')?.textContent?.substring(0, 100)
            };
        });
        
        // Test live version
        console.log('🌐 Testing Live Version...');
        await page.goto('https://play.techkwiz.com/', { waitUntil: 'networkidle2' });
        
        const liveData = await page.evaluate(() => {
            return {
                title: document.title,
                hasWelcome: document.body.textContent.includes('Welcome to TechKwiz'),
                hasQuiz: document.body.textContent.includes('Level Up!'),
                buttonCount: document.querySelectorAll('button').length,
                scripts: Array.from(document.querySelectorAll('script')).map(s => s.src).filter(s => s),
                stylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href),
                bodyClasses: document.body.className,
                hasNavigation: !!document.querySelector('nav'),
                mainContent: document.querySelector('main')?.textContent?.substring(0, 100)
            };
        });
        
        console.log('\n📊 COMPARISON RESULTS:');
        console.log('======================');
        
        console.log(`Title - Local: "${localData.title}", Live: "${liveData.title}"`);
        console.log(`Welcome Message - Local: ${localData.hasWelcome}, Live: ${liveData.hasWelcome}`);
        console.log(`Quiz Content - Local: ${localData.hasQuiz}, Live: ${liveData.hasQuiz}`);
        console.log(`Button Count - Local: ${localData.buttonCount}, Live: ${liveData.buttonCount}`);
        console.log(`Has Navigation - Local: ${localData.hasNavigation}, Live: ${liveData.hasNavigation}`);
        console.log(`Body Classes - Local: "${localData.bodyClasses}", Live: "${liveData.bodyClasses}"`);
        
        console.log('\n📝 Main Content Comparison:');
        console.log(`Local: "${localData.mainContent}"`);
        console.log(`Live:  "${liveData.mainContent}"`);
        
        console.log('\n📦 Script Comparison:');
        console.log(`Local Scripts: ${localData.scripts.length}`);
        console.log(`Live Scripts: ${liveData.scripts.length}`);
        
        if (localData.scripts.length !== liveData.scripts.length) {
            console.log('🚨 SCRIPT COUNT MISMATCH!');
        }
        
        console.log('\n🎨 Stylesheet Comparison:');
        console.log(`Local Stylesheets: ${localData.stylesheets.length}`);
        console.log(`Live Stylesheets: ${liveData.stylesheets.length}`);
        
        // Check if they're identical
        const identical = JSON.stringify(localData) === JSON.stringify(liveData);
        console.log(`\n🔍 Deployments Identical: ${identical}`);
        
        if (!identical) {
            console.log('\n🚨 DEPLOYMENT MISMATCH DETECTED!');
            console.log('The live site is serving different content than local.');
            console.log('This suggests a deployment issue.');
        } else {
            console.log('\n✅ Deployments are identical');
            console.log('The issue is not a deployment mismatch.');
        }
        
        // Test navigation on live site
        console.log('\n🔗 Testing Live Navigation...');
        try {
            await page.goto('https://play.techkwiz.com/start', { 
                waitUntil: 'domcontentloaded',
                timeout: 10000 
            });
            
            const startPageContent = await page.evaluate(() => {
                return {
                    title: document.title,
                    hasContent: document.body.textContent.length > 100,
                    isLoading: document.body.textContent.includes('Loading'),
                    hasError: document.body.textContent.includes('404') || document.body.textContent.includes('not found')
                };
            });
            
            console.log('✅ /start page loaded');
            console.log(`  Title: ${startPageContent.title}`);
            console.log(`  Has Content: ${startPageContent.hasContent}`);
            console.log(`  Is Loading: ${startPageContent.isLoading}`);
            console.log(`  Has Error: ${startPageContent.hasError}`);
            
        } catch (navError) {
            console.log(`❌ Navigation failed: ${navError.message}`);
        }
        
    } catch (error) {
        console.error('❌ Comparison failed:', error.message);
    } finally {
        await browser.close();
    }
}

compareDeployments().catch(console.error);
