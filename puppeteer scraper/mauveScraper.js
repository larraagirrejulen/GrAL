
const mvScrapperObject = {

    // Page we want to scrape
    url: 'https://mauve.isti.cnr.it/singleValidation.jsp',

    // Scraping function
    async scraper(browser, evaluationUrl){

        // Create new page and navigate to url
        let page = await browser.newPage();
        await page.goto(this.url);

        // Wait for input element to load
        await page.waitForSelector('#uri');

        // Load the url we want to evaluate and submit
        await page.focus('#uri');
        await page.keyboard.type(evaluationUrl);
        await page.click('#validate');

        // Wait for results to be loaded
        await page.waitForSelector('#evaluationSummary');

        // Set default download directory:
        const path = require('path');
        const client = await page.target().createCDPSession(); 
        await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: path.resolve('./evaluations'), });

        // Start evaluation download and wait for 3 secs
        await page.click('#evaluationSummary a[title="download earl report"]');
        await page.waitForTimeout(3000);

        // Close page
        await page.close();

    }

}

module.exports = mvScrapperObject;