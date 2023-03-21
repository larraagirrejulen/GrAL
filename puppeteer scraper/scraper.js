
const jsonLd = require('./jsonLd');



const scraper = {



    async scrape(page, evaluator, evaluationUrl, evaluatedPageTitle){

        console.log("Initiating " + evaluator.toUpperCase() + " scraping process ...");

        this.json = new jsonLd(evaluator, evaluationUrl, evaluatedPageTitle);

        try{
            switch(evaluator){
                case 'am':
                    await this.amScraper(page, evaluationUrl, 'https://accessmonitor.acessibilidade.gov.pt/results/');
                    break;
                case 'ac':
                    await this.acScraper(page, evaluationUrl, 'https://achecker.achecks.ca/checker/index.php');
                    break;
                case 'mv':
                    await this.mvScraper(page, evaluationUrl, 'https://mauve.isti.cnr.it/singleValidation.jsp');
                    break;
                default:
                    throw new Error("\n" + evaluator.toUpperCase() + " is not a valid evaluator !!!");
            }

            console.log("\nSUCCESS: " + evaluator.toUpperCase() + " scraping process successfully finished !!!");
            
        } catch(error) { throw new Error("\nThe next error was found on " + evaluator.toUpperCase()  + " scraping process: " + error) }

        return this.json.getJson();
    },




    async amScraper(page, evaluationUrl, evaluatorUrl){

        // Navigate to url and wait to be loaded
        await page.goto(evaluatorUrl + evaluationUrl.replaceAll("/",'%2f'));
        await page.waitForSelector('.evaluation-table');

        // Get interested data
        const results = await page.evaluate(async () => {
            var results = [];
            const techniquesFound = Array.from(document.querySelectorAll('.evaluation-table tbody tr'));

            for (var i = 0, technique; technique = techniquesFound[i]; i++){

                const cols = Array.from(technique.querySelectorAll('td'));
                 
                var status;
                const statusText = cols[0].querySelector('svg title').textContent;

                switch(statusText){
                    case "monitor_icons_praticas_status_incorrect":
                        status = "FAIL";
                        break;
                    case "monitor_icons_praticas_status_review":
                        status = "CANNOTTELL";
                        break;
                    case "monitor_icons_praticas_status_correct":
                        status = "PASS";
                        break;
                    default:
                        continue;
                }

                const techniqueInfo = cols[1].querySelector('.collapsible-content');
                const criteriaIds = Array.from(techniqueInfo.querySelectorAll('li')).map(li => li.textContent.substring(18,24).replaceAll(' ',''));
                const techniqueGuideText = techniqueInfo.querySelector("p").textContent.replace(/\u00A0/g, " ");
                
                var casesLink = null;
                const link = cols[3].querySelector("a").href;
                if(link.startsWith("/results")){
                    casesLink = 'https://accessmonitor.acessibilidade.gov.pt' + link;
                }else if(link.startsWith("https://accessmonitor.acessibilidade.gov.pt/")){
                    casesLink = link;
                }

                results.push({
                    "outcome": status,
                    "criteriaIds": criteriaIds,
                    "criteriaDescription": techniqueGuideText,
                    "casesLink": casesLink
                });
            }
            return results;  
        });
        var criterias;
        for (var i = 0, result; result = results[i]; i++){
            criterias = result["criteriaIds"];

            for (var j = 0, criteria; criteria = criterias[j]; j++){
                if (result["casesLink"] != null){
                    await page.goto(result["casesLink"]);
                    await page.waitForSelector('#list_tab');
                    const [casesLocations, casesHtmls] = await page.evaluate(async () => {
                        
                        var casesLocations = [];
                        var casesHtmls = [];
                        const foundCases = Array.from(document.querySelectorAll('ol > li'));

                        for (var l = 0, ca; ca = foundCases[l]; l++){
                            caseElements = Array.from(ca.querySelectorAll('table > tr'));
                            caseCode = caseElements[1].querySelector("td code").textContent;
                            caseCode = caseCode.replaceAll('\n','');
                            caseCode = caseCode.replaceAll('\t','');
                            casesHtmls.push(caseCode);
                            casesLocations.push(caseElements[3].querySelector('td span').textContent);
                        }
                        return [casesLocations, casesHtmls];  
                    });
                    for (var k = 0, path; path = casesLocations[k]; k++){
                        var correctPath = "//" + path
                        correctPath = correctPath.replace(/ \> /g, "/")
                        correctPath = correctPath.replace(/:nth-child\(/g, "[")
                        correctPath = correctPath.replaceAll(")", "]")
                        
                        this.json.addNewAssertion(criteria, result["outcome"], result["criteriaDescription"], correctPath, casesHtmls[k]);
                    }
                }else{
                    this.json.addNewAssertion(criteria, result["outcome"], result["criteriaDescription"]);
                }       
            }
        }
  
    },






    async acScraper(page, evaluationUrl, evaluatorUrl){

        // Navigate to url
        await page.goto(evaluatorUrl);

        // Wait for input element to load
        await page.waitForSelector('#checkuri');

        // Configure to include AAA level
        await page.focus('h2[align="left"] a');
        await page.click('h2[align="left"] a');
        await page.focus("#radio_gid_9");
        await page.click("#radio_gid_9");

        // Load the url we want to evaluate and submit
        await page.focus('#checkuri');
        await page.keyboard.type(evaluationUrl);
        await page.click('#validate_uri');

        // Wait for results to be loaded
        await page.waitForSelector('fieldset[class="group_form"]', {timeout: 60000});

        // Get evaluation data
        const results = await page.evaluate(() => {
            
            var results = [];
            var errors, warnings, problems, criterias, checks, criteria_num, check, problem, solution, actual_text, cases, error_location, error_code;

            // Found errors
            errors = document.querySelector('#AC_errors');
            criterias = Array.from(errors.querySelectorAll("h4"));
            checks = Array.from(errors.querySelectorAll(".gd_one_check"));

            for (var i = 0, criteria; criteria = criterias[i]; i++){
                criteria_num = criteria.textContent.substring(17,22).replaceAll(' ','');
                check = checks[i];

                problem = check.querySelector("span a").textContent;
                solution = check.querySelector("div").textContent.substring(9).trim();
                actual_text = 'The next ERROR was found: "'+problem+'". You can solve it with: "'+solution+'".'

                cases = Array.from(check.querySelectorAll("table tbody tr td"));
                for (var j = 0, found_case; found_case = cases[j]; j++){
                    error_location = found_case.querySelector("em").textContent;
                    error_code = found_case.querySelector("pre code").textContent;
                    actual_text += '     ' + error_location + ': ' + error_code + '"\n\n';

                    results.push({
                        "criteria_num": criteria_num,
                        "outcome": "FAIL",
                        "description": actual_text,
                        "location": error_location,
                        "target_html": error_code
                    });
                }
            }


            // Found warnings
            warnings = document.querySelector('#AC_likely_problems');
            criterias = Array.from(warnings.querySelectorAll("h4"));
            checks = Array.from(warnings.querySelectorAll(".gd_one_check"));

            for (var i = 0, criteria; criteria = criterias[i]; i++){
                criteria_num = criteria.textContent.substring(17,22).replaceAll(' ','');
                check = checks[i];

                problem = check.querySelector("span a").textContent;
                actual_text = 'The next WARNING was found: "'+problem+'".'

                cases = Array.from(check.querySelectorAll("table tbody tr td"));
                for (var j = 0, found_case; found_case = cases[j]; j++){
                    error_location = found_case.querySelector("em").textContent;
                    error_code = found_case.querySelector("pre code").textContent;
                    actual_text += '     ' + error_location + ': ' + error_code + '"\n\n';

                    results.push({
                        "criteria_num": criteria_num,
                        "outcome": "CANNOTTELL",
                        "description": actual_text,
                        "location": error_location,
                        "target_html": error_code
                    });
                }
            }


            // Found potentian problems
            problems = document.querySelector('#AC_potential_problems');
            criterias = Array.from(problems.querySelectorAll("h4"));
            checks = Array.from(problems.querySelectorAll(".gd_one_check"));

            for (var i = 0, criteria; criteria = criterias[i]; i++){
                criteria_num = criteria.textContent.substring(17,22).replaceAll(' ','');
                check = checks[i];

                problem = check.querySelector("span a").textContent;
                actual_text = 'A POTENTIAL PROBLEM was found: "'+problem+'".'

                cases = Array.from(check.querySelectorAll("table tbody tr td"));
                for (var j = 0, found_case; found_case = cases[j]; j++){
                    error_location = found_case.querySelector("em").textContent;
                    error_code = found_case.querySelector("pre code").textContent;
                    actual_text += '     ' + error_location + ': ' + error_code + '"\n\n';

                    results.push({
                        "criteria_num": criteria_num,
                        "outcome": "CANNOTTELL",
                        "description": actual_text,
                        "location": error_location,
                        "target_html": error_code
                    });
                }
            }


            return results;
        });


        for (var i = 0, result; result = results[i]; i++){
            this.json.addNewAssertion(result.criteria_num, result.outcome, result.description, result.location, result.target_html);
        }
        
    },





    async mvScraper(page, evaluationUrl, evaluatorUrl){

        // Navigate to url
        await page.goto(evaluatorUrl);

        // Wait for input element to load
        await page.waitForSelector('#uri');

        // Load the url we want to evaluate and submit
        await page.focus('#uri');
        await page.keyboard.type(evaluationUrl);
        await page.click('#validate');

        // Wait for results to be loaded
        await page.waitForSelector('#evaluationSummary');

        // Set default download directory:
        const path = require('path');
        const client = await page.target().createCDPSession(); 
        await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: path.resolve('./evaluations'), });

        // Start evaluation download and wait for 3 secs
        await page.click('#evaluationSummary a[title="download earl report"]');
        await page.waitForTimeout(3000);

    }
}

module.exports = scraper;