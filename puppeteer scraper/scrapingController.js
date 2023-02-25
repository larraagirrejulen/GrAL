
const puppeteer = require('puppeteer');
const scraper = require('./scraper');
const fs = require("fs");


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

async function scrapeSelected(MV, AM, AC, evaluationUrl){

	const evaluators = ["MV", "AM", "AC"];
	const selectedEvaluators = [MV, AM, AC];
	
	for(var i=evaluators.length-1; i>=0; i--) if(!selectedEvaluators[i]) evaluators.splice(i,1);

	const results = await withBrowser(async (browser) => {
		return Promise.all(evaluators.map(async (evaluator) => {
			return withPage(browser)(async (page) => {
				return scraper.scrape(page, evaluator, evaluationUrl);
			});
		}));
	});

	fs.writeFile('./resultData.json', JSON.stringify(results, null, 2), err => {
		if (err) {
			console.log('Error writing file', err)
		} else {
			console.log('Successfully wrote file')
		}
	});

	return results;

}

module.exports = (MV, AM, AC, evaluationUrl) => scrapeSelected(MV, AM, AC, evaluationUrl)