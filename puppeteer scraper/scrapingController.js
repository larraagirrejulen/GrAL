
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
		merge(results[0], results[i]);
	}

	fs.writeFile('./resultData.json', JSON.stringify(results[0], null, 2), err => {
		if (err) console.log('Error writing file', err)
	});

	return JSON.stringify(results[0]);

}


function merge(jsonLd1, jsonLd2){

	if(jsonLd2["dct:date"] > jsonLd1["dct:date"]) jsonLd1["dct:date"] = jsonLd2["dct:date"];

	jsonLd1.assertors.push(...jsonLd2.assertors);

	jsonLd1.creator["xmlns:name"] += " & " + jsonLd2.creator["xmlns:name"];

	for (let i = 0; i < jsonLd1.auditSample.length; i++) {

        let assertion1 = jsonLd1.auditSample[i];
        let assertion2 = jsonLd2.auditSample[i];
		
		if(assertion2.result.outcome === "earl:untested"){ 
			continue; 

		} else if(assertion1.result.outcome === "earl:untested"){

            jsonLd1.auditSample[i] = assertion2;

        } else {

			if((assertion1.result.outcome === "earl:inapplicable" && assertion2.result.outcome !== "earl:inapplicable") 
			|| (assertion1.result.outcome === "earl:passed" && (assertion2.result.outcome === "earl:cantTell" || assertion2.result.outcome === "earl:failed"))
            || (assertion1.result.outcome === "earl:cantTell" && assertion2.result.outcome === "earl:failed")){

				jsonLd1.auditSample[i].result = assertion2.result;
	
			}

            jsonLd1.auditSample[i].hasPart.push(...assertion2.hasPart);

		}

	}

}




module.exports = (AM, AC, MV, PA, evaluationUrl, evaluatedPageTitle) => scrapeSelected(AM, AC, MV, PA, evaluationUrl, evaluatedPageTitle)