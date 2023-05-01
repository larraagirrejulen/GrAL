
const puppeteer = require('puppeteer');
const Scraper = require('./scraper');
const fs = require("fs");
const mergeJsonLds = require('../jsonLd/jsonLdUtils');


const withBrowser = async (fn) => {
	const browser = await puppeteer.launch({ 
		headless: true,
		args: ["--disable-setuid-sandbox", "--lang=en"],
		'ignoreHTTPSErrors': true
	});
	try {
		return await fn(browser);
	} finally {
		await browser.close();
	}
}


const withPage = (browser) => async (fn) => {
	const page = await browser.newPage();
	try {
		return await fn(page);
	} finally {
		await page.close();
	}
}


async function scrapeSelected(AM, AC, MV, PA, evaluationUrl, evaluatedPageTitle){

	const evaluators = ["am", "ac", "mv", "pa"];
	const selectedEvaluators = [AM, AC, MV, PA];
	
	for(var i=evaluators.length-1; i>=0; i--) if(!selectedEvaluators[i]) evaluators.splice(i,1);

	const results = await withBrowser(async (browser) => {
		return await Promise.all(
			evaluators.map(async (evaluator) => {
				return await withPage(browser)(async (page) => {
					var scraper = new Scraper(page, evaluator, evaluationUrl, evaluatedPageTitle);
					return await scraper.initiateScrapingProcess().catch((error) => {
						console.log("\n" + error + "\n");
					});
				});
			}
		));
	});

	for(var i = 1; i<results.length; i++){
		mergeJsonLds(results[0], results[i]);
	}

	fs.writeFile('./resultData.json', JSON.stringify(results[0], null, 2), err => {
		if (err) console.log('Error writing file', err)
	});

	return JSON.stringify(results[0]);

}




module.exports = (AM, AC, MV, PA, evaluationUrl, evaluatedPageTitle) => scrapeSelected(AM, AC, MV, PA, evaluationUrl, evaluatedPageTitle)