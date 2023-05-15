
const JsonLd = require('../jsonLd/jsonLd');
const pa11y = require('pa11y');
const { URL } = require('url');

/**
 * Class representing a web page scraper to evaluate a pages accesibility.
*/
class Scraper {

    #evaluator;
    #evaluationScope;
    #jsonld;
    #browser;
    
    /** 
     * Constructor to create a new Scraper instance.
     * 
     * @param {Page} page - A Puppeteer page object.
     * @param {string} evaluator - The selected evaluator: 'am', 'ac', 'mv' or 'pa'.
     * @param {string} evaluationScope - The URL of the web pages to evaluate.
     * @throws Will throw an error if the evaluator is not valid.
    */
    constructor(evaluator, evaluationScope, browser){

        if (!['am', 'ac', 'mv', 'a11y', 'pa', 'lh'].includes(evaluator)) {
            throw new Error(evaluator.toUpperCase() + " is not a valid evaluator !!!");
        }

        this.#evaluator = evaluator;
        this.#evaluationScope = evaluationScope;
        this.#jsonld = new JsonLd(evaluator, evaluationScope);
        this.#browser = browser;
    }



    /**
     * Performs the scraping process.
     * 
     * @returns {object} - The JSON-LD evaluation report resulting of the scraping process.
     * @throws Will throw an error if an error occurs during the scraping process.
    */
    async performScraping(){

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

        const evaluators = {
            'am': async (webPage, page) => this.amScraper('https://accessmonitor.acessibilidade.gov.pt/', webPage, page),
            'ac': async (webPage, page) => this.acScraper('https://achecker.achecks.ca/checker/index.php', webPage, page),
            'mv': async (webPage, page) => this.mvScraper('https://mauve.isti.cnr.it/singleValidation.jsp', webPage, page),
            'a11y': async (webPage, page) => this.a11yScraper(webPage, page),
            'pa': async (webPage, page) => this.pa11yScraper(webPage),
            'lh': async (webPage, page) => this.lhScraper(webPage, page)
        };

        console.log("\nInitiating " + this.#evaluator.toUpperCase() + " scraping process ...");

        try{

            await Promise.all(this.#evaluationScope.map(async (webPage) => {

                return await withPage(this.#browser)(async (page) => {
    
                    console.log("\n  " + this.#evaluator.toUpperCase() + ": Starting with " + webPage.url + " ...");
                    await evaluators[this.#evaluator](webPage, page);
                    console.log("\n  " + this.#evaluator.toUpperCase() + ": " + webPage.url + " scraping finished.");
                    
                });

            }));
            
            console.log(`\n${this.#evaluator.toUpperCase()} scraping successfully finished !!!`);

        } catch(error) { throw new Error("\nThe next error was found on " + this.#evaluator.toUpperCase()  + " scraping process: " + error) }

        return this.#jsonld.getJsonLd();
    }



    /**
     * Scrapes results from the Access Monitor evaluator and loads them into the jsonLd..
     * @async
     * @function amScraper
     * @param {string} evaluatorUrl - The URL of the Access Monitor evaluator.
     * @param {Page} page - The puppeteer page object to be used for scraping.
     * @returns {void}
    */
    async amScraper(evaluatorUrl, webPage, page){

        await page.goto(evaluatorUrl);
        await page.waitForSelector('#url', {timeout: 30000});
        await page.focus('#url');
        await page.keyboard.type(webPage.url);
        await page.click('.card_actions button');

        await page.waitForSelector('table.evaluation-table > tbody', {timeout: 60000});

        const results = await page.evaluate(() => {

            const results = [];

            const status2Outcome = {
                "Non acceptable practice": "earl:failed",
                " Practice to view manually ": "earl:cantTell",
                "Acceptable practice": "earl:passed"
            };

            const foundTechniques = Array.from(document.querySelectorAll('table.evaluation-table > tbody > tr'));

            for (const technique of foundTechniques){

                const cols = Array.from(technique.querySelectorAll('td'));

                const outcome = status2Outcome[cols[0].querySelector('svg title').textContent];

                if (!outcome) continue;

                const techniqueInfo = cols[1].querySelector('.collapsible-content');
                const criteriaNumbers = Array.from(techniqueInfo.querySelectorAll('li')).map(li => li.textContent.substring(18,24).replaceAll(' ',''));
                let description = techniqueInfo.querySelector("p").textContent.replace(/\u00A0/g, " ");
                description += "\n\n" + techniqueInfo.querySelector("div > span > strong > a").textContent.replace(/\u00A0/g, " ").substring(4).replace(":", "").replace(" ", "");

                results.push({
                    "outcome": outcome,
                    "criteriaNumbers": criteriaNumbers,
                    "description": description
                });
            }
            return results;  
        });

        const rows = await page.$$("table.evaluation-table > tbody > tr");

        for(let i = 0; i < rows.length; i++){

            const link = await rows[i].$('td > a');
            
            if(link){

                await page.evaluate(el => el.scrollIntoView(), link);

                const href = await link.evaluate(el => el.getAttribute('href'));

                if(href.startsWith("/results") || href.startsWith("https://accessmonitor.acessibilidade.gov.pt/")){
                    
                    const tr = i + 1

                    await page.click("table.evaluation-table > tbody > tr:nth-child("+ tr +") > td:nth-child(4) > a");
                    await page.waitForSelector('#list_tab');

                    const casesLocations = await page.evaluate(async () => {
                        
                        const casesLocations = [];
                        const foundCases = Array.from(document.querySelectorAll('ol > li'));

                        for (const foundCase of foundCases){
                            const caseElements = Array.from(foundCase.querySelectorAll('table > tr'));
                            casesLocations.push(caseElements[3].querySelector('td span').textContent);
                        }
                        return casesLocations;  
                    });

                    results[i]["casesLocations"] = casesLocations;

                    await page.click('section > nav > a[href^="/results/"]');
                }
            }
        }

        await page.goto(webPage.url);

        for(const result of results){
            if(result.casesLocations){
                for (const path of result.casesLocations){

                    if(path.startsWith("html > head")){
                        continue;
                    }

                    try{
                        await page.waitForSelector(path);
                    }catch(error){
                        continue;
                    }
    
                    const targetElement = await page.$(path);
    
                    const targetHtml = await page.evaluate(el => el.outerHTML, targetElement);
    
                    for (const criteria of result.criteriaNumbers){
                        await this.#jsonld.addNewAssertion(criteria, result.outcome, result.description, webPage.url, path, targetHtml);
                    } 
                }
            }else{
                for (const criteria of result.criteriaNumbers){
                    await this.#jsonld.addNewAssertion(criteria, result.outcome, result.description, webPage.url);
                }
            }
            
        }
    }



    /**
     * Scrapes results from the AChecker evaluator and loads them into the jsonLd..
     * @async
     * @function amScraper
     * @param {string} evaluatorUrl - The URL of the AChecker evaluator.
     * @param {object} page - The Puppeteer page object to use for web scraping.
     * @returns {void}
     */
    async acScraper(evaluatorUrl, webPage, page){

        await page.goto(evaluatorUrl);

        await page.waitForSelector('#checkuri');

        // Configure to include AAA level, type the url to evaluate and submit
        await page.click('h2[align="left"] a');
        await page.click("#radio_gid_9");
        await page.click("#show_source");
        await page.focus('#checkuri');
        await page.keyboard.type(webPage.url);
        await page.click('#validate_uri');

        // Wait for results to be loaded
        await page.waitForSelector('fieldset[class="group_form"]', {timeout: 120000});

        const results = await page.evaluate(() => {

            var results = [];

            function pushResults(id){

                const cases = document.querySelector(id);
                const children = cases.children;

                for(const child of children){
                    if (child.tagName === 'H4') {

                        const criteria = child.textContent.match(/(\d\.\d\.\d)/)[0];

                        let nextSibling = child.nextSibling;

                        while (nextSibling){

                            if(nextSibling.tagName === 'H3'){
                                break;
                            }else if(nextSibling.tagName === 'DIV'){

                                const problem = nextSibling.querySelector("span > a").textContent;
                                
                                let solution;
                                if(id === "#AC_errors"){
                                    solution = nextSibling.querySelector("div").textContent.substring(9).trim();
                                }
                                
                                const foundCases = Array.from(nextSibling.querySelectorAll("table > tbody > tr > td"));
                
                                for (const foundCase of foundCases){

                                    const path = foundCase.querySelector("em").textContent;

                                    const regex = /Line (\d+), Column (\d+)/;
                                    const match = regex.exec(path);

                                    const line = document.querySelector("#line-" + parseInt(match[1]));

                                    if(!line) continue;
                                        
                                    const html = line.textContent.substring(parseInt(match[2])-1);

                                    let querySelector = html.replace(/[\n\t]/g, '').replace(/\n\s*/g, '').replace(/\"/g, "'");

                                    querySelector = querySelector.substring(0, querySelector.indexOf(">")+1);

                                    if(querySelector.substring(0, querySelector.indexOf(">")+1).indexOf(" ") > -1){
                                    
                                        querySelector = querySelector.replace(/<|>/g, "")
                                        
                                        querySelector = querySelector.substring(0, querySelector.indexOf(" ")) + "[" + querySelector.substring(querySelector.indexOf(" ")+1) + "]"
                                        querySelector = querySelector.replaceAll("/]", "]").replace(/\s+]/g, "]").replaceAll("' ", "'][");

                                        if(querySelector.indexOf("[style='") > 0){
                                            const querySelector1 = querySelector.substring(0, querySelector.indexOf("[style='"))
                                            const querySelector2 = querySelector.substring(querySelector.indexOf("[style='"))

                                            querySelector = querySelector1 + querySelector2.substring(querySelector2.indexOf("']")+2)
                                        }

                                        querySelector = querySelector.replace("hidden ", "hidden][");
                                        querySelector = querySelector.replace("async ", "async][");

                                    }else{
                                        querySelector = querySelector.replace(/<|>/g, "")
                                    }

                                    results.push({
                                        "criteriaNumber": criteria,
                                        "outcome": id === "#AC_errors" ? "earl:failed": "earl:cantTell",
                                        "description": id === "#AC_errors" ? problem + '\n\n' + solution : problem,
                                        "targetPath": querySelector,
                                        "targetHtml": html
                                    });
                                }

                            }
                            nextSibling = nextSibling.nextSibling;
                        }
                        console.log('Child is an h4 element');
                    }
                }
            }

            ["#AC_errors", "#AC_likely_problems", "#AC_potential_problems"].map((id) => pushResults(id));

            return results;

        });

        for (const result of results){
            await this.#jsonld.addNewAssertion(result.criteriaNumber, result.outcome, result.description, webPage.url, result.targetPath, result.targetHtml);
        }
    }



    /**
     * Scrapes results from the Mauve evaluator and loads them into the jsonLd..
     * @async
     * @function mvScraper
     * @param {string} evaluatorUrl - The URL of the Mauve evaluator.
     * @param {object} page - The Puppeteer page object to use for web scraping.
     * @returns {void}
     */
    async mvScraper(evaluatorUrl, webPage, page){

        // Navigate to url
        await page.goto(evaluatorUrl);

        // Wait for input element to load
        await page.waitForSelector('#uri');

        // Load the url we want to evaluate and submit
        await page.focus('#uri');
        await page.keyboard.type(webPage.url);
        await page.select('#Level_of_Conformance', 'AAA');
        await page.click('#validate');

        // Wait for results to be loaded
        await page.waitForSelector('#livepreview_link');
        await page.waitForTimeout(3000);    // Ez dakit bestela nola egin daitekeen
        await page.click('#livepreview_link');

        // Wait for the loader to disappear
        await page.waitForFunction(() => {
            const loader = document.querySelector('#loader');
            return loader && loader.classList.contains('display_none');
        });

        // Get evaluation data
        const results = await page.evaluate(() => {
            
            var results = [];

            function pushResults(outcomeType){

                const foundCases = Array.from(document.querySelectorAll('#container_' + outcomeType + '_list > div'));                

                for (const foundCase of foundCases){
    
                    const description = foundCase.querySelector("span[class='error_summary']").textContent;
    
                    let occurrences = foundCase.querySelector(".accordion_content");
    
                    occurrences = Array.from(occurrences.querySelectorAll("div > span[class='single_error_info']"));
    
                    for (const occurrence of occurrences){
        
                        let location = occurrence.querySelector("button");
    
                        try{
                            location = location.getAttribute("data-x");
                        }catch(error){
                            continue;
                        }
        
                        results.push({
                            "criterias": foundCase.querySelector("div > span").textContent.match(/(\d\.\d\.\d)/g),
                            "outcome": outcomeType === "error" ? "earl:failed" : "earl:cantTell",
                            "description": description,
                            "xpath": location
                        });
                    }
    
                }
            }   

            ["error", "warning"].map((outcomeType) => pushResults(outcomeType));

            const criteriaTable = Array.from(document.querySelectorAll('#table_sc_occ > tbody > tr'));

            for(const criteriaTableRow of criteriaTable){
                
                const outcomes = Array.from(criteriaTableRow.children);

                if (outcomes[1].textContent.match(/\d+/)[0] === "0" && 
                    outcomes[2].textContent.match(/\d+/)[0] === "0"  && 
                    outcomes[3].textContent.match(/\d+/)[0] !== "0" ){

                    results.push({
                        "criterias": outcomes[0].querySelector("p").textContent,
                        "outcome": "earl:passed",
                        "description": "PASSED"
                    })
                }
            }

            return results;
        });

        await page.goto(webPage.url);

        for (const result of results){

            if(result.outcome === "earl:passed"){
                await this.#jsonld.addNewAssertion(result.criterias, result.outcome, result.description, webPage.url);
            }else{

                await page.waitForXPath(result.xpath);

                const [targetElement] = await page.$x(result.xpath);

                const targetHtml = await page.evaluate(el => el.outerHTML, targetElement);

                for (const criteria of result.criterias){
                    await this.#jsonld.addNewAssertion(criteria, result.outcome, result.description, webPage.url, result.xpath, targetHtml);
                }
            }

        }
    }



    /**
     * Evaluates the page with a11y library and loads them data into jsonLd.
     * @async
     * @function a11yScraper
     * @returns {void}
     */
    async a11yScraper(webPage, page){

        await page.goto(webPage.url);
        await page.waitForTimeout(5000);

        await page.addScriptTag({ path: './scraping/a11yAinspector.js' });

        const results = await page.evaluate(() => {

            a11yResults = [];

            // Configure evaluator factory and get evaluator
            const evaluatorFactory = OpenAjax.a11y.EvaluatorFactory.newInstance();
            evaluatorFactory.setParameter('ruleset', OpenAjax.a11y.RulesetManager.getRuleset('ARIA_STRICT'));
            evaluatorFactory.setFeature('eventProcessing', 'fae-util');
            evaluatorFactory.setFeature('groups', 7);
            const evaluator = evaluatorFactory.newEvaluator();

            // Perform evaluation
            const evaluationResult = evaluator.evaluate(window.document, window.location.title, window.location.href);

            // Get interested results data and fill the jsonld evaluation report
            const ruleResults = evaluationResult.getRuleResultsAll().getRuleResultsArray();

            const ruleResult2Outcome = {
                1: "earl:inapplicable", // NOT_APPLICABLE
                2: "earl:passed",   // PASS
                3: "earl:cantTell",  // MANUAL_CHECK
                5: "earl:failed"    // VIOLATION
            }

            for(const ruleResult of ruleResults) {

                const outcome = ruleResult2Outcome[ruleResult.getResultValue()];

                if (!outcome || !ruleResult.isRuleRequired()) continue;

                let description = ruleResult.getRuleSummary() + "\n\n";
                description += ruleResult.getResultMessagesArray().filter(message => message !== "N/A").join("\n\n");

                const successCriteria = ruleResult.getRule().getPrimarySuccessCriterion().id;
                const results = ruleResult.getElementResultsArray();

                if (results.length <= 0){
                    a11yResults.push({
                        "successCriteria": successCriteria, 
                        "outcome": outcome, 
                        "description": description, 
                        "url": window.location.href,
                        "xpath": null,
                        "html": null
                    });
                    
                }else{
                    for(const result of results) {
                        let xpath = result.getDOMElement().xpath;
                        xpath = "/" + xpath.substring(xpath.indexOf("]/")+1)
                        xpath = xpath.replace(/\[@id='([\w\s-]+?)'\]\[@role='([\w\s-]+?)'\]/g, "[@id='$1']");
                        xpath = xpath.replace(/\[@class='([\w\s-]+?)'\]/g, "");

                        const html = result.getDOMElement().node.outerHTML.replace(/[\n\t]/g, "");

                        a11yResults.push({
                            "successCriteria": successCriteria, 
                            "outcome": outcome, 
                            "description": description, 
                            "url": window.location.href,
                            "xpath": xpath,
                            "html": html
                        });
                    }
                }
            }

            return a11yResults;
        })

        //console.log("\nStarting loading data: " + webPage.url);
        for(const result of results) {
            await this.#jsonld.addNewAssertion(result.successCriteria, result.outcome, result.description, result.url, result.xpath, result.html);
        }
        //console.log("Loading data finished: " + webPage.url);
        
    }

    
    
    /**
     * Scrapes results with the Pa11y library and loads them into the jsonLd.
     * @async
     * @function pa11yScraper
     * @returns {void}
     */
    async pa11yScraper(webPage){

        const results = await pa11y(webPage.url, {
            standard: 'WCAG2AAA',
            includeWarnings: true,
            timeout: 90000
        });
        //console.log("\nStarting loading data: " + webPage.url);
        for(const issue of results.issues){

            const criteria = issue.code.match(/(\d\_\d\_\d)/)[0].replaceAll("_", ".")

            const outcome = issue.typeCode === 1 ? "earl:failed" : "earl:cantTell"

            await this.#jsonld.addNewAssertion(criteria, outcome, issue.message, webPage.url, issue.selector, issue.context);
        }
        //console.log("Loading data finished: " + webPage.url);
    }




    /**
     * Scrapes results with the lighthouse library and loads them into the jsonLd.
     * @async
     * @function lhScraper
     * @param {object} page - The Puppeteer page object to use for web scraping.
     * @returns {void}
     */
    async lhScraper(webPage, page){

        await page.goto(webPage.url);

        const lighthouseModule = await import('lighthouse');
        const lighthouse = lighthouseModule.default;

        // Generate the Lighthouse report
        const report = await lighthouse(webPage.url, {
            port: (new URL(this.#browser.wsEndpoint())).port,
            onlyCategories: ['accessibility'],
            formFactor: 'desktop',
            throttling: {
                // Set network throttling options for desktop
                rttMs: 40,
                throughputKbps: 10 * 1024,
                cpuSlowdownMultiplier: 1,
                requestLatencyMs: 0,
                downloadThroughputKbps: 0,
                uploadThroughputKbps: 0,
            },
            screenEmulation: {
                // Set screen emulation options for desktop
                mobile: false,
                width: 1920,
                height: 1080,
                deviceScaleFactor: 1,
                disabled: false,
            },
            output: 'json'
        });

        const accessibilityResults = report.lhr.audits;

        const criteria = {
            "aria-allowed-attr": "4.1.2",
            "aria-command-name": "4.1.2",
            "aria-hidden-body": "4.1.2",
            "aria-hidden-focus": "4.1.2",
            "aria-input-field-name": "4.1.2",
            "aria-meter-name": "1.1.1",
            "aria-progressbar-name": "1.1.1",
            "aria-required-attr": "4.1.2",
            "aria-required-parent": "1.3.1",
            "aria-roles": "4.1.2",
            "aria-toggle-field-name": "4.1.2",
            "aria-tooltip-name": "4.1.2",
            "aria-valid-attr-value": "4.1.2",
            "aria-valid-attr": "4.1.2",
            "bypass": "2.4.1",
            "color-contrast": "1.4.3",
            "definition-list": "1.3.1",
            "dlitem": "1.3.1",
            "document-title": "2.4.2",
            "duplicate-id-active": "4.1.1",
            "duplicate-id-aria": "4.1.1",
            "form-field-multiple-labels": "3.3.2",
            "frame-title": "4.1.2",
            "html-has-lang": "3.1.1",
            "html-lang-valid": "3.1.1",
            "image-alt": "1.1.1",
            "input-image-alt": "1.1.1",
            "label": "4.1.2",
            "link-name": "4.1.2",
            "list": "1.3.1",
            "listitem": "1.3.1",
            "meta-refresh": "2.2.1",
            "meta-viewport": "1.4.4",
            "object-alt": "1.1.1",
            "td-headers-attr": "1.3.1",
            "th-has-data-cells": "1.3.1",
            "valid-lang": "3.1.2",
            "video-caption": "1.2.2"
        };

        for(const key in accessibilityResults){
            
            const audit = accessibilityResults[key];

            if(audit.score === 0){
                
                const tag = audit.details.debugData.tags[2].slice(4);
                const criteria = tag.slice(0, 1) + "." + tag.slice(1, 2) + "." + tag.slice(2);

                for(const item of audit.details.items){
                    const path = item.node.selector;
                    const html = item.node.snippet;
                    const description = audit.description + "\n\n" + item.node.explanation;

                    await this.#jsonld.addNewAssertion(criteria, "earl:failed", description, webPage.url, path, html);
                }
            }else{

                const description = audit.description;

                if(!criteria[audit.id]) continue;

                let outcome;

                if(audit.score === 1){

                    outcome = "earl:passed";
    
                }else if(audit.scoreDisplayMode === "notApplicable"){
    
                    outcome = "earl:inapplicable";
    
                }else if(audit.scoreDisplayMode === "manual"){
    
                    outcome = "earl:cantTell";
    
                }

                await this.#jsonld.addNewAssertion(criteria[audit.id], outcome, description, webPage.url);

            } 
        }
    }

}



module.exports = Scraper;
