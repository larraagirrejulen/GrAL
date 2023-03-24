
const puppeteer = require('puppeteer');
const Scraper = require('./scraper');
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

async function scrapeSelected(AM, AC, MV, evaluationUrl, evaluatedPageTitle){

	const evaluators = ["am", "ac", "mv"];
	const selectedEvaluators = [AM, AC, MV];
	
	for(var i=evaluators.length-1; i>=0; i--)
		if(!selectedEvaluators[i])
			evaluators.splice(i,1);

	const results = await withBrowser(async (browser) => {
		return await Promise.all(
			evaluators.map(async (evaluator) => {
				return await withPage(browser)(async (page) => {
					var scraper = new Scraper(page, evaluator, evaluationUrl, evaluatedPageTitle);
					return await scraper.scrape().catch((error) => {
						console.log("\n" + error + "\n");
					});
				});
			}
		));
	});

	fs.writeFile('./resultData.json', JSON.stringify(results, null, 2), err => {
		if (err) console.log('Error writing file', err)
	});

	console.log(results.length);
	//console.log(results);
	console.log(results[0].creator["xmlns:name"] + "  ------  " + results[1].creator["xmlns:name"]);
	/*for(var i = 1; i<results.length; i++){
		results[0] = merge(results[0], results[i]);
	}*/

	return JSON.stringify(results[0]);

}

function merge(jsonLd1, jsonLd2){
	if(jsonLd2["dct:date"] > jsonLd1["dct:date"]) jsonLd1["dct:date"] = jsonLd2["dct:date"]
	jsonLd1.assertors.push(jsonLd2.assertors[0]);
	jsonLd1.creator["xmlns:name"] = jsonLd1.creator["xmlns:name"] + " & " + jsonLd2.creator["xmlns:name"];

}

module.exports = (AM, AC, MV, evaluationUrl, evaluatedPageTitle) => scrapeSelected(AM, AC, MV, evaluationUrl, evaluatedPageTitle)