const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
    try {
        const browser = await puppeteer.launch({ 
            executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
            headless: 'new'
        });
        const page = await browser.newPage();
        
        await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
        
        const fileUrl = 'file://' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
        console.log('Loading ' + fileUrl);
        await page.goto(fileUrl, { waitUntil: 'networkidle2' });
        
        await new Promise(r => setTimeout(r, 2000));
        
        const screenshotPath = path.join(__dirname, 'preview-mobile-full.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        
        await browser.close();
        console.log('Screenshot taken: ' + screenshotPath);
    } catch(err) {
        console.error(err);
    }
})();
