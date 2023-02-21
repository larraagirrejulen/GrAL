
const scraper = {

    mvUrl: 'https://mauve.isti.cnr.it/singleValidation.jsp',
    amUrl: 'https://accessmonitor.acessibilidade.gov.pt/results/',
    acUrl: 'https://achecker.achecks.ca/checker/index.php',

    async scrape(page, evaluator, evaluationUrl){

        // Call to specified scraper
        var result;
        switch(evaluator){
            case 'MV':
                result = this.mvScraper(page, evaluationUrl);
                break;
            case 'AM':
                result = this.amScraper(page, evaluationUrl);
                break;
            case 'AC':
                result = this.acScraper(page, evaluationUrl);
                break;
            default:
                result = "SCRAPER ERROR: Wrong evaluator!";
        }

        // Return result
        return result;
    },

    async mvScraper(page, evaluationUrl){

        // Navigate to url
        await page.goto(this.mvUrl);

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

        // Return data
        return "nice";
    },

    async amScraper(page, evaluationUrl){

        // Navigate to url
        const url = this.amUrl + evaluationUrl.replaceAll("/",'%2f');
        await page.goto(url);

        // Wait for results to be loaded
        await page.waitForSelector('.evaluation-table');
        const [table, score] = await page.evaluate(() => {
            const table = document.querySelector('.evaluation-table');
            const score = document.querySelector('.reading-block');
            return [table.innerHTML, score.innerHTML];
        });

        // Return data
        return [table, score];
    },

    async acScraper(page, evaluationUrl){

        // Navigate to url
        await page.goto(this.acUrl);

        // Wait for input element to load
        await page.waitForSelector('#checkuri');

        // Load the url we want to evaluate and submit
        await page.focus('#checkuri');
        await page.keyboard.type(evaluationUrl);
        await page.click('#validate_uri');

        // Wait for results to be loaded
        await page.waitForSelector('fieldset[class="group_form"]', {timeout: 60000});

        // Get evaluation data
        const data = await page.evaluate(() => {
            const table = document.querySelector('fieldset[class="group_form"]');
            return table.innerHTML;
        });

        // Return data
        return data;
    }
}

module.exports = scraper;