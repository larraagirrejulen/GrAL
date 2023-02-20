const amScrapperObject = {
    url: 'https://accessmonitor.acessibilidade.gov.pt/',
    async scraper(browser, evaluationUrl){
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        // Navigate to the selected page
        await page.goto(this.url);

        await page.waitForSelector('#url');
        //await page.$eval('#url', el => el.value = "https://www.ehu.eus/es/home");
        await page.focus('#url')
        await page.keyboard.type("https://www.ehu.eus/es/home")
        await page.click('button[type="submit"]');

        await page.waitForSelector('.evaluation-table');
        const [table, score] = await page.evaluate(() => {
            const table = document.querySelector('.evaluation-table');
            const score = document.querySelector('.reading-block');
            return [table.innerHTML, score.innerHTML];
        });
        console.log(score);
        console.log(table);

        await page.close();

        return [table, score];
    }
}

module.exports = amScrapperObject;