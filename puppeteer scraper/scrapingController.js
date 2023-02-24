
const puppeteer = require('puppeteer');
const scraper = require('./scraper');


const withBrowser = async (fn) => {
	const browser = await puppeteer.launch({ 
		headless: false,
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
	const page1 = await browser.newPage();
	try {
		return await fn(page, page1);
	} finally {
		await page.close();
		await page1.close();
	}
}

async function scrapeSelected(MV, AM, AC, evaluationUrl){

	const evaluators = ["MV", "AM", "AC"];
	const selectedEvaluators = [MV, AM, AC];
	
	for(var i=evaluators.length-1; i>=0; i--) if(!selectedEvaluators[i]) evaluators.splice(i,1);

	const results = await withBrowser(async (browser) => {
		return Promise.all(evaluators.map(async (evaluator) => {
			return withPage(browser)(async (page, page1) => {
				return scraper.scrape(page, page1, evaluator, evaluationUrl);
			});
		}));
	});
	return results;

}

module.exports = (MV, AM, AC, evaluationUrl) => scrapeSelected(MV, AM, AC, evaluationUrl)