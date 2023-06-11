
const puppeteer = require('puppeteer');
const Scraper = require('./scraper');
const fs = require("fs");
const mergeJsonLds = require('./jsonLd/jsonLdUtils');
const JsonLd = require('./jsonLd/jsonLd');


/**
 * Wraps a function that requires a browser instance and returns its result after closing the browser.
 * @param {Function} fn - The function to be wrapped.
 * @returns {Promise} - A promise that resolves with the result of the wrapped function.
 */
const withBrowser = async (fn) => {
	let browser;
	try {
		browser = await puppeteer.launch({ 
			headless: true,
			args: ["--disable-setuid-sandbox", "--lang=en", '--start-maximized'],
			'ignoreHTTPSErrors': true
		});
		return await fn(browser);
	} finally {
		if(browser) await browser.close();
	}
}


/**
 * Wraps a function that requires a page instance and returns its result after closing the page.
 * @param {Object} browser - The browser instance to create the page on.
 * @returns {Function} - A function that accepts a function to be wrapped and returns a promise that resolves with the result of the wrapped function.
 */
const withPage = (browser) => async (fn) => {
	let page;
	try {
		page = await browser.newPage();
		await page.setViewport({ width: 1920, height: 1080});
		return await fn(page);
	} finally {
		if(page) await page.close();
	}
}


/**
 * Scrapes the selected webpages based on the request object.
 * 
 * @function scrapeSelected
 * @param {Object} request - The request object that contains the selected evaluators, the url and the title of the page to evaluate.
 * @returns {Promise} - A promise that resolves with the JSON stringified version of the merged scraped reports.
 */
async function scrapeSelected(request){

	const activeEvaluators = ["am", "ac", "mv", "a11y", "pa", "lh"].filter((evaluator) => request[evaluator]);

	const results = await Promise.all(activeEvaluators.map(async (evaluator) => {

		console.log("\nInitiating " + evaluator.toUpperCase() + " scraping process ...");

		const jsonLd = new JsonLd(evaluator, request.scope);

		await withBrowser(async (browser) => {

			const scraper = new Scraper(evaluator, jsonLd, browser);

			if(evaluator === "lh"){

				for(const webPage of request.scope){

					await scraper.performScraping(webPage);

				}

			}else{

				await Promise.all(request.scope.map(async (webPage) => {

					await withPage(browser)(async (page) => {

						await scraper.performScraping(webPage, page);

					});

				}));

			}
			
		});

		console.log(`\n${evaluator.toUpperCase()} scraping successfully finished !!!`);

		return jsonLd.getJsonLd();

	}));


	for(let i = 1; i<results.length; i++){
		mergeJsonLds(results[0], results[i]);
	}

	/*fs.writeFile('./resultData.json', JSON.stringify(results[0], null, 2), err => {
		if (err) console.log('Error writing file', err)
	});*/

	return JSON.stringify(results[0]);
}


module.exports = (request) => scrapeSelected(request)