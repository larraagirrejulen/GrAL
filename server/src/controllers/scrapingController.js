
const Scraper = require('../scraping/scraper');
const mergeJsonLds = require('../utils/jsonLdUtils');
const JsonLd = require('../scraping/jsonLd');
const fs = require("fs");
const { withBrowser, withPage } = require('../utils/puppeteerUtils');




/**
 * Scrapes the selected webpages based on the request object.
 * 
 * @function scrapeSelected
 * @param {Object} request - The request object that contains the selected evaluators, the url and the title of the page to evaluate.
 * @returns {Promise} - A promise that resolves with the JSON stringified version of the merged scraped reports.
 */
async function scrapeSelected(request){

	const activeEvaluators = ["am", "ac", "mv", "a11y", "pa", "lh"].filter((evaluator) => request[evaluator]);

	console.time('Execution Time');

	const results = await Promise.all(activeEvaluators.map(async (evaluator) => {

		console.log("\nInitiating " + evaluator.toUpperCase() + " scraping process ...");

		const jsonLd = new JsonLd(evaluator, request.scope);
		const scraper =  new Scraper(evaluator, jsonLd);

		switch (evaluator) {
			case "lh":
				await withBrowser(async (browser) => {
					for(const webPage of request.scope){
						await scraper.performScraping(webPage, null, browser);
					}
				});
			  	break;

			case "pa":
			  	await Promise.all(request.scope.map(async (webPage) => {
					await scraper.performScraping(webPage);
				}));
			 	break;

			default:
				await withBrowser(async (browser) => {
					await Promise.all(request.scope.map(async (webPage) => {
						await withPage(browser)(async (page) => {
							await scraper.performScraping(webPage, page);
						});
					}));
				});
				break;
		}

		console.log(`\n${evaluator.toUpperCase()} scraping successfully finished !!!`);

		return jsonLd.getJsonLd();

	}));

	console.timeEnd('Execution Time');

	for(let i = 1; i<results.length; i++){
		mergeJsonLds(results[0], results[i]);
	}

	/*fs.writeFile('./src/scraping/resultData.json', JSON.stringify(results[0], null, 2), err => {
		if (err) console.log('Error writing file', err)
	});*/

	return JSON.stringify(results[0]);
}


module.exports = (request) => scrapeSelected(request)