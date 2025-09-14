const puppeteer = require('puppeteer');

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        const url = `https://chartink.com/screener/${process.argv[2]}`; // Replace with your target URL
        
        // Wait for the page to fully load before proceeding
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Now wait for an element that confirms the content is ready
        // You might need to change this selector based on your page
        await page.waitForSelector('body', { timeout: 30000 });

        const stocksSelector = "a[href*='stocks-new']:not(.font-medium)";

        await page.waitForSelector(stocksSelector);

        // Perform the query after confirming the page is stable
        const elements = await page.$$(stocksSelector);

        if (elements.length > 0) {
            console.log(`For ${process.argv[3]} Found ${elements.length / 2} stocks`);
            for (let i = 0; i < elements.length; i += 2) {
                const element = elements[i];
                const textContent = await page.evaluate(el => el.textContent, element);
                console.log(`Stock name: `, textContent.trim());
            }
        } else {
            console.log('No elements found with the given XPath.');
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
        if (error.name === 'TimeoutError') {
            console.error('The page took too long to load or the selector was not found.');
        } else if (error.name === 'TargetCloseError') {
            console.error('The browser target was closed unexpectedly.');
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();