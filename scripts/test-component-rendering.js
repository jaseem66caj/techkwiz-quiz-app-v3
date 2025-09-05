const puppeteer = require('puppeteer');

async function testComponentRendering() {
    console.log('🧪 Testing Component Rendering Issues...');
    
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
        console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
        console.log(`[PAGE ERROR] ${error.message}`);
    });
    
    try {
        console.log('📱 Loading live site...');
        await page.goto('https://play.techkwiz.com/', { waitUntil: 'networkidle2' });
        
        // Wait for page to fully load
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check what's actually rendered
        const pageContent = await page.evaluate(() => {
            return {
                title: document.title,
                bodyText: document.body.textContent,
                hasWelcomeMessage: document.body.textContent.includes('Welcome to TechKwiz'),
                hasQuizInterface: document.querySelector('.glass-effect') !== null,
                hasQuestionText: document.body.textContent.includes('Which social media platform'),
                hasAnswerButtons: document.querySelectorAll('button').length,
                allButtonTexts: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()),
                hasLoadingSpinner: document.querySelector('.animate-spin') !== null,
                mainContent: document.querySelector('main')?.textContent?.trim(),
                hasEnhancedQuizInterface: document.querySelector('[class*="quiz"]') !== null,
                allClassNames: Array.from(document.querySelectorAll('*')).map(el => el.className).filter(c => c).slice(0, 20)
            };
        });
        
        console.log('\n📊 Page Analysis:');
        console.log(`Title: ${pageContent.title}`);
        console.log(`Has Welcome Message: ${pageContent.hasWelcomeMessage}`);
        console.log(`Has Quiz Interface: ${pageContent.hasQuizInterface}`);
        console.log(`Has Question Text: ${pageContent.hasQuestionText}`);
        console.log(`Number of Buttons: ${pageContent.hasAnswerButtons}`);
        console.log(`Has Loading Spinner: ${pageContent.hasLoadingSpinner}`);
        console.log(`Has Enhanced Quiz Interface: ${pageContent.hasEnhancedQuizInterface}`);
        
        console.log('\n🔍 Button Texts Found:');
        pageContent.allButtonTexts.forEach((text, i) => {
            console.log(`  ${i + 1}. "${text}"`);
        });
        
        console.log('\n📝 Main Content:');
        console.log(pageContent.mainContent?.substring(0, 200) + '...');
        
        // Test local version for comparison
        console.log('\n🏠 Testing Local Version...');
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const localContent = await page.evaluate(() => {
            return {
                title: document.title,
                hasWelcomeMessage: document.body.textContent.includes('Welcome to TechKwiz'),
                hasQuizInterface: document.querySelector('.glass-effect') !== null,
                hasQuestionText: document.body.textContent.includes('Which social media platform'),
                hasAnswerButtons: document.querySelectorAll('button').length,
                allButtonTexts: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()),
                hasLoadingSpinner: document.querySelector('.animate-spin') !== null,
                mainContent: document.querySelector('main')?.textContent?.trim()
            };
        });
        
        console.log('\n📊 Local Version Analysis:');
        console.log(`Title: ${localContent.title}`);
        console.log(`Has Welcome Message: ${localContent.hasWelcomeMessage}`);
        console.log(`Has Quiz Interface: ${localContent.hasQuizInterface}`);
        console.log(`Has Question Text: ${localContent.hasQuestionText}`);
        console.log(`Number of Buttons: ${localContent.hasAnswerButtons}`);
        console.log(`Has Loading Spinner: ${localContent.hasLoadingSpinner}`);
        
        console.log('\n🔍 Local Button Texts:');
        localContent.allButtonTexts.forEach((text, i) => {
            console.log(`  ${i + 1}. "${text}"`);
        });
        
        // Compare the two
        console.log('\n⚖️  COMPARISON:');
        console.log(`Welcome Message - Live: ${pageContent.hasWelcomeMessage}, Local: ${localContent.hasWelcomeMessage}`);
        console.log(`Quiz Interface - Live: ${pageContent.hasQuizInterface}, Local: ${localContent.hasQuizInterface}`);
        console.log(`Button Count - Live: ${pageContent.hasAnswerButtons}, Local: ${localContent.hasAnswerButtons}`);
        
        if (pageContent.hasWelcomeMessage !== localContent.hasWelcomeMessage) {
            console.log('🚨 CRITICAL: Welcome message rendering differs between live and local!');
        }
        
        if (pageContent.hasAnswerButtons !== localContent.hasAnswerButtons) {
            console.log('🚨 CRITICAL: Button count differs between live and local!');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testComponentRendering().catch(console.error);
