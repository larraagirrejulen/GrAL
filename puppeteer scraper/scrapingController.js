
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
	
	for(var i=evaluators.length-1; i>=0; i--) if(!selectedEvaluators[i]) evaluators.splice(i,1);

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

	for(var i = 1; i<results.length; i++){
		merge(results[0], results[i]);
	}

	fs.writeFile('./resultData.json', JSON.stringify(results[0], null, 2), err => {
		if (err) console.log('Error writing file', err)
	});

	return JSON.stringify(results[0]);

}


function merge(jsonLd1, jsonLd2){

	if(jsonLd2["dct:date"] > jsonLd1["dct:date"]) jsonLd1["dct:date"] = jsonLd2["dct:date"]

	jsonLd1.assertors.push(jsonLd2.assertors[0]);

	jsonLd1.creator["xmlns:name"] += " & " + jsonLd2.creator["xmlns:name"];

	for (var i = 0, assertion1, assertion2; assertion1 = jsonLd1.auditSample[i], assertion2 = jsonLd2.auditSample[i]; i++){
		
		if(assertion2.result.outcome === "earl:untested"){ 

			continue; 

		} else if(/^(earl:untested|earl:inapplicable)$/.test(assertion1.result.outcome)){

			assertion1 = assertion2;

		} else {

			mergeFoundCases(assertion1, assertion2);

			if((assertion1.result.outcome === "earl:passed" && assertion2.result.outcome !== "earl:passed") 
			|| (assertion1.result.outcome === "earl:cantTell" && assertion2.result.outcome === "earl:failed")){

				assertion1.result = assertion2.result;
	
			}

		}

	}

}


function mergeFoundCases(assertion1, assertion2){
		
	assertion2.hasPart.forEach(case2 => {
	
		case_index = assertion1.hasPart.findIndex((case1) => {
			return case1.result.outcome === case2.result.outcome;
		});

		if(case_index === -1){
			assertion1.hasPart.push(case2);
			return;
		}

		case2.assertedBy.forEach((assertor)=>{
			console.log(assertor);
			assertion1.hasPart[case_index].assertedBy.push(assertor);
		});

		assertion1.hasPart[case_index].result.description += "\n" + case2.result.description;

		case2.result.locationPointersGroup.forEach((pointer2) => {
			
			exists_index = assertion1.hasPart[case_index].result.locationPointersGroup.findIndex((pointer1) => {
				return pointer1.description === pointer2.description;
			});

			if(exists_index === -1){
				assertion1.hasPart[case_index].result.locationPointersGroup.push(pointer2);					
			}else if(pointer2["ptr:expression"].startsWith("//html/body")){
				assertion1.hasPart[case_index].result.locationPointersGroup[exists_index]["ptr:expression"] = pointer2["ptr:expression"];
			}
			
		});

	});

}

module.exports = (AM, AC, MV, evaluationUrl, evaluatedPageTitle) => scrapeSelected(AM, AC, MV, evaluationUrl, evaluatedPageTitle)