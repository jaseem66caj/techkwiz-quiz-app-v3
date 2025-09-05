const puppeteer = require('puppeteer');

async function debugDOMStructure() {
    console.log('🔍 Debugging DOM Structure...');
    
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('📱 Loading local site...');
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Get detailed DOM structure
        const domStructure = await page.evaluate(() => {
            const main = document.querySelector('main');
            if (!main) return { error: 'No main element found' };
            
            const getElementInfo = (element, depth = 0) => {
                if (depth > 3) return '...'; // Limit depth
                
                const info = {
                    tag: element.tagName,
                    classes: element.className,
                    id: element.id,
                    text: element.textContent?.substring(0, 50) + (element.textContent?.length > 50 ? '...' : ''),
                    children: []
                };
                
                for (let child of element.children) {
                    info.children.push(getElementInfo(child, depth + 1));
                }
                
                return info;
            };
            
            return {
                mainStructure: getElementInfo(main),
                hasEnhancedQuizInterface: !!document.querySelector('[class*="bg-gray-800"]'),
                hasGlassEffect: !!document.querySelector('.glass-effect'),
                allDivs: Array.from(document.querySelectorAll('div')).map(div => ({
                    classes: div.className,
                    hasBackdrop: div.className.includes('backdrop'),
                    hasGray800: div.className.includes('bg-gray-800'),
                    text: div.textContent?.substring(0, 30)
                })).slice(0, 10),
                buttonParents: Array.from(document.querySelectorAll('button')).map(btn => ({
                    buttonText: btn.textContent?.trim(),
                    parentClass: btn.parentElement?.className,
                    grandParentClass: btn.parentElement?.parentElement?.className
                }))
            };
        });
        
        console.log('\n📊 DOM Structure Analysis:');
        console.log('Main Element Structure:', JSON.stringify(domStructure.mainStructure, null, 2));
        
        console.log('\n🔍 Component Detection:');
        console.log(`Has Enhanced Quiz Interface: ${domStructure.hasEnhancedQuizInterface}`);
        console.log(`Has Glass Effect: ${domStructure.hasGlassEffect}`);
        
        console.log('\n📦 Div Elements (first 10):');
        domStructure.allDivs.forEach((div, i) => {
            if (div.classes) {
                console.log(`${i + 1}. Classes: "${div.classes}"`);
                console.log(`   Text: "${div.text}"`);
            }
        });
        
        console.log('\n🔘 Button Parent Analysis:');
        domStructure.buttonParents.forEach((btn, i) => {
            console.log(`${i + 1}. Button: "${btn.buttonText}"`);
            console.log(`   Parent: "${btn.parentClass}"`);
            console.log(`   Grandparent: "${btn.grandParentClass}"`);
        });
        
        // Take a screenshot for visual debugging
        await page.screenshot({ 
            path: 'debug-dom-structure.png',
            fullPage: true 
        });
        console.log('\n📸 Screenshot saved: debug-dom-structure.png');
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    } finally {
        await browser.close();
    }
}

debugDOMStructure().catch(console.error);
