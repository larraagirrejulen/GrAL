const puppeteer = require('puppeteer');
const scraper = require('./scraper');
const fs = require('fs');


const withBrowser = async (fn) => {
	const browser = await puppeteer.launch({ 
		headless: false,
		args: ["--disable-setuid-sandbox"],
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

async function scrapeSelected(AM, AC, MV, evaluationUrl){

	const evaluators = ["MV", "AM", "AC"];
	const selectedEvaluators = [AM, AC, MV];
	
	for(var i=evaluators.length-1; i>=0; i--) if(!selectedEvaluators[i]) evaluators.pop();

	const results = await withBrowser(async (browser) => {
		return Promise.all(evaluators.map(async (evaluator) => {
			return withPage(browser)(async (page) => {
				return scraper.scrape(page, evaluator, evaluationUrl);
			});
		}));
	});

	/*fs.writeFile("results.json", JSON.stringify(results), 'utf8', function(err) {
		if(err) {
			return console.log(err);
		}
		console.log("The data has been scraped and saved successfully! View it at './results.json'");
	});*/

}

module.exports = (AM, AC, MV, evaluationUrl) => scrapeSelected(AM, AC, MV, evaluationUrl)