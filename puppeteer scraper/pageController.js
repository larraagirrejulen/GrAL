const mvScrapperObject = require('./mauveScraper');
const fs = require('fs');
async function scrapeAll(browserInstance, AM, AC, MV, scrapUrl){
	let browser;
	try{
		browser = await browserInstance;
		let scrapedData = {};
		// Call the scraper for different set of books to be scraped
		scrapedData['mv'] = await mvScrapperObject.scraper(browser, "https://www.ehu.eus/es/home");
		/*scrapedData['am'] = await amScrapperObject.scraper(browser, "https://www.ehu.eus/es/home");
		scrapedData['ac'] = await acScrapperObject.scraper(browser, "https://www.ehu.eus/es/home");*/
		await browser.close();
		/*fs.writeFile("mauve.json", JSON.stringify(scrapedData), 'utf8', function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    console.log("The data has been scraped and saved successfully! View it at './mauve.json'");
		});*/
	}
	catch(err){
		console.log("Could not resolve the browser instance => ", err);
	}
}

module.exports = (browserInstance) => scrapeAll(browserInstance)