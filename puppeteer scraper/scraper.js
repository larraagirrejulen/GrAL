
const JsonLd = require('./jsonLd');


class Scraper {

    #puppeteer_page;
    #evaluator;
    #evaluationUrl;
    #jsonld;


    constructor(page, evaluator, evaluationUrl, evaluatedPageTitle){

        if (!['am', 'ac', 'mv'].includes(evaluator)) {
            throw new Error(evaluator.toUpperCase() + " is not a valid evaluator !!!");
        }

        this.#puppeteer_page = page;
        this.#evaluator = evaluator;
        this.#evaluationUrl = evaluationUrl;
        this.#jsonld = new JsonLd(evaluator, evaluationUrl, evaluatedPageTitle);
    }


    
    async initiateScrapingProcess(){

        const evaluators = {
            'am': async () => this.amScraper('https://accessmonitor.acessibilidade.gov.pt/results/', this.#puppeteer_page),
            'ac': async () => this.acScraper('https://achecker.achecks.ca/checker/index.php', this.#puppeteer_page),
            'mv': async () => this.mvScraper('https://mauve.isti.cnr.it/singleValidation.jsp', this.#puppeteer_page)
        };

        console.log("\nInitiating " + this.#evaluator.toUpperCase() + " scraping process ...");

        try{
            await evaluators[this.#evaluator]();
            console.log(`\n${this.#evaluator.toUpperCase()} scraping successfully finished !!!`);
            
        } catch(error) { throw new Error("\nThe next error was found on " + this.#evaluator.toUpperCase()  + " scraping process: " + error) }

        return this.#jsonld.getJsonLd();
    }




    async amScraper(evaluatorUrl, page){

        await page.goto(evaluatorUrl + this.#evaluationUrl.replaceAll("/",'%2f'));
        await page.waitForSelector('.evaluation-table');

        const results = await page.evaluate(() => {

            const results = [];

            const status2Outcome = {
                "monitor_icons_praticas_status_incorrect": "FAIL",
                "monitor_icons_praticas_status_review": "CANNOTTELL",
                "monitor_icons_praticas_status_correct": "PASS"
            };

            const foundTechniques = Array.from(document.querySelectorAll('.evaluation-table tbody tr'));

            for (const technique of foundTechniques){

                const cols = Array.from(technique.querySelectorAll('td'));

                const outcome = status2Outcome[cols[0].querySelector('svg title').textContent];

                if (!outcome) continue;

                const techniqueInfo = cols[1].querySelector('.collapsible-content');
                const criteriaIds = Array.from(techniqueInfo.querySelectorAll('li')).map(li => li.textContent.substring(18,24).replaceAll(' ',''));
                const description = techniqueInfo.querySelector("p").textContent.replace(/\u00A0/g, " ");
                
                let casesLink = null;
          
                if(cols[3].querySelector("a") != undefined){
                    const link = cols[3].querySelector("a").href;
                    if(link.startsWith("/results")){
                        casesLink = 'https://accessmonitor.acessibilidade.gov.pt' + link;
                    }else if(link.startsWith("https://accessmonitor.acessibilidade.gov.pt/")){
                        casesLink = link;
                    }
                } 

                results.push({
                    "outcome": outcome,
                    "criteriaIds": criteriaIds,
                    "description": description,
                    "casesLink": casesLink
                });
            }
            return results;  
        });

        for (const result of results){
            for (const criteria of result.criteriaIds){

                if (result.casesLink === null){
                    this.#jsonld.addNewAssertion(criteria, result.outcome, result.description);
                    continue;
                }

                await page.goto(result.casesLink);
                await page.waitForSelector('#list_tab');
                const [casesLocations, casesHtmls] = await page.evaluate(async () => {
                    
                    const casesLocations = [];
                    const casesHtmls = [];
                    const foundCases = Array.from(document.querySelectorAll('ol > li'));

                    for (const foundCase of foundCases){
                        const caseElements = Array.from(foundCase.querySelectorAll('table > tr'));
                        const caseCode = caseElements[1].querySelector("td code").textContent.replaceAll('\n','').replaceAll('\t','');
                        casesHtmls.push(caseCode);
                        casesLocations.push(caseElements[3].querySelector('td span').textContent);
                    }
                    return [casesLocations, casesHtmls];  
                });

                for (let k = 0, path; path = casesLocations[k]; k++){
                    const correctPath = "//" + path.replace(/ \> /g, "/").replace(/:nth-child\(/g, "[").replaceAll(")", "]")
                    this.#jsonld.addNewAssertion(criteria, result.outcome, result.description, correctPath, casesHtmls[k]);
                }

            }
        }

    }






    async acScraper(evaluatorUrl, page){

        // Navigate to url
        await page.goto(evaluatorUrl);

        // Wait for input element to load
        await page.waitForSelector('#checkuri');

        // Configure to include AAA level, type the url to evaluate and submit
        await page.click('h2[align="left"] a');
        await page.click("#radio_gid_9");
        await page.focus('#checkuri');
        await page.keyboard.type(this.#evaluationUrl);
        await page.click('#validate_uri');

        // Wait for results to be loaded
        await page.waitForSelector('fieldset[class="group_form"]', {timeout: 120000});

        // Get evaluation data
        const results = await page.evaluate(() => {

            var results = [];

            function pushResults(id){

                const cases = document.querySelector(id);
                const criterias = Array.from(cases.querySelectorAll("h4"));
                const checks = Array.from(cases.querySelectorAll(".gd_one_check"));

                for (let i = 0, criteria; criteria = criterias[i]; i++){
                
                    const problem = checks[i].querySelector("span a").textContent;

                    let solution;
                    if(id === "#AC_errors"){
                        solution = checks[i].querySelector("div").textContent.substring(9).trim();
                    }
                    
                    const foundCases = Array.from(checks[i].querySelectorAll("table tbody tr td"));
    
                    for (const foundCase of foundCases){
    
                        const targetPath = foundCase.querySelector("em").textContent;
                        const targetHtml = foundCase.querySelector("pre code").textContent;
    
                        results.push({
                            "criteria_num": criteria.textContent.match(/(\d\.\d\.\d)/g)[0],
                            "outcome": id === "#AC_errors" ? "FAIL" : "CANNOTTELL",
                            "description": id === "#AC_errors" ? 'An ERROR was found: \n\n' + problem + '\n\n' + solution : 'A POSSIBLE ISSUE was found: \n\n' + problem,
                            "location": targetPath,
                            "target_html": targetHtml
                        });
                    }
                }
            }

            pushResults("#AC_errors");
            pushResults("#AC_likely_problems");
            pushResults("#AC_potential_problems");

            return results;
        });

        for (var i = 0, result; result = results[i]; i++){
            this.#jsonld.addNewAssertion(result.criteria_num, result.outcome, result.description, result.location, result.target_html);
        }
    }





    async mvScraper(evaluatorUrl, page){

        // Navigate to url
        await page.goto(evaluatorUrl);

        // Wait for input element to load
        await page.waitForSelector('#uri');

        // Load the url we want to evaluate and submit
        await page.focus('#uri');
        await page.keyboard.type(this.#evaluationUrl);
        await page.select('#Level_of_Conformance', 'AAA');
        await page.click('#validate');

        // Wait for results to be loaded
        await page.waitForSelector('#livepreview_link');
        await page.waitForTimeout(1000);    // Ez dakit bestela nola egin daitekeen
        await page.click('#livepreview_link');

        // Wait for the loader to disappear
        await page.waitForFunction(() => {
            const loader = document.querySelector('#loader');
            return loader && loader.classList.contains('display_none');
        });

        // Get evaluation data
        const results = await page.evaluate(() => {
            
            let results = [];
            let criterias, description, occurrences, location;

            const errors = Array.from(document.querySelectorAll('#container_error_list > div'));
            const warnings = Array.from(document.querySelectorAll('#container_warning_list > div'));

            for (let i = 0, error; error = errors[i]; i++){

                criterias = error.querySelector("div > span");

                criterias = criterias.textContent.match(/(\d\.\d\.\d)/g);

                description = error.querySelector("span[class='error_summary']");

                description = description.textContent;

                occurrences = error.querySelector(".accordion_content");

                occurrences = Array.from(occurrences.querySelectorAll("div > span[class='single_error_info']"));

                for (let j = 0, occurrence; occurrence = occurrences[j]; j++){
    
                    location = occurrence.querySelector("button");

                    try{
                        location = location.getAttribute("data-x");
                    }catch(error){
                        continue;
                    }
                    
    
                    results.push({
                        "criterias": criterias,
                        "outcome": "FAIL",
                        "description": description,
                        "location": location,
                        "target_html": occurrence.textContent.substring(11)
                    });
                }

            }

            for (let i = 0, warning; warning = warnings[i]; i++){

                criterias = warning.querySelector("div > span");

                criterias = criterias.textContent.match(/(\d\.\d\.\d)/g);

                description = warning.querySelector("span[class='error_summary']");

                description = description.textContent;

                occurrences = warning.querySelector(".accordion_content");

                occurrences = Array.from(occurrences.querySelectorAll("div > span[class='single_error_info']"));

                for (let j = 0, occurrence; occurrence = occurrences[j]; j++){
    
                    location = occurrence.querySelector("button");

                    try{
                        location = location.getAttribute("data-x");
                    }catch(error){
                        continue;
                    }
    
                    results.push({
                        "criterias": criterias,
                        "outcome": "CANNOTTELL",
                        "description": description,
                        "location": location,
                        "target_html": occurrence.textContent.substring(11)
                    });
                }

            }

            criterias = Array.from(document.querySelectorAll('#table_sc_occ > tbody > tr'));

            for(let i = 0, criteria; criteria = criterias[i]; i++){
                
                outcomes = Array.from(criteria.children);

                let fail = outcomes[1].textContent.match(/\d+/); // find all matches of the regular expression in the string
                let cannotTell = outcomes[2].textContent.match(/\d+/);
                let pass = outcomes[3].textContent.match(/\d+/);

                if(parseInt(fail[0]) === 0 && parseInt(cannotTell[0]) === 0  && parseInt(pass[0]) > 0 ){

                    criteriaNumber = outcomes[0].querySelector("p");

                    results.push({
                        "criterias": criteriaNumber.textContent,
                        "outcome": "PASS",
                        "description": ""
                    })
                }
            }

            return results;
        });

        for (let i = 0, result; result = results[i]; i++){

            if(result.outcome === "PASS"){
                this.#jsonld.addNewAssertion(result.criterias, result.outcome, result.description);
            }else{
                for (let j = 0, criteria; criteria = result.criterias[j]; j++){
                    this.#jsonld.addNewAssertion(criteria, result.outcome, result.description, result.location, result.target_html);
                }
            }

            
        }

    }
}

module.exports = Scraper;