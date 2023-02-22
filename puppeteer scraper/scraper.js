
import jsonLd from './jsonLd';

const { table } = require('console');
const { getTemplate } = require('./jsonTemplate');

const scraper = {

    mvUrl: 'https://mauve.isti.cnr.it/singleValidation.jsp',
    amUrl: 'https://accessmonitor.acessibilidade.gov.pt/results/',
    acUrl: 'https://achecker.achecks.ca/checker/index.php',
    template: jsonLd.getTemplate(),

    async scrape(page, evaluator, evaluationUrl){

        // Call to specified scraper
        var result;
        switch(evaluator){
            case 'MV':
                result = this.mvScraper(page, evaluationUrl);
                break;
            case 'AM':
                result = this.amScraper(page, evaluationUrl);
                break;
            case 'AC':
                result = this.acScraper(page, evaluationUrl);
                break;
            default:
                result = "SCRAPER ERROR: Wrong evaluator!";
        }

        // Return result
        return result;
    },


    async mvScraper(page, evaluationUrl){

        // Navigate to url
        await page.goto(this.mvUrl);

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

        // Return data
        return "nice";
    },


    async amScraper(page, evaluationUrl){

        // Navigate to url
        const url = this.amUrl + evaluationUrl.replaceAll("/",'%2f');
        await page.goto(url);

        // Wait for results to be loaded
        await page.waitForSelector('.evaluation-table');
        const [rows, score] = await page.evaluate(() => {
            
            const score = document.querySelector('.reading-block');
            
            const rows = Array.from(document.querySelectorAll('.evaluation-table tbody tr'));
            for (var i = 0, row; row = rows[i]; i++){
                objeto_codigos_fallantes = {}
                const cols = Array.from(row.querySelectorAll('td'));
                divc = cols[1].querySelector('.collapsible-content');
                nivel = cols[2].textContent;
                nivel = nivel.replaceAll(' ','');
                if (nivel == 'A' || nivel =='AA'){
                    const estandares = Array.from(divc.querySelectorAll('li')).map(li => li.textContent.substring(21,26));
                    var array_prueba = [];
                    tipo_texto = cols[0].querySelector('svg title').textContent;
                    tipo = false;
                    var texto_final;
                    if (tipo_texto == "monitor_icons_praticas_status_incorrect"){
                        tipo = true;
                        array_prueba.push("Failed");
                        acf_res = "Failed";
                        texto_final += "The next ERROR was found: \n\n"
                    }else if (tipo_texto == "monitor_icons_praticas_status_review"){
                        tipo = true;
                        array_prueba.push("Cannot Tell");
                        acf_res = "Warning";
                        texto_final += "The next WARNING was found: \n\n"
                    }else if (tipo_texto == "monitor_icons_praticas_status_correct"){
                        array_prueba.push("Passed");
                        acf_res = "Passed";
                        texto_final += "The next CORRECTION CHECK was found: \n\n"
                    }
                    //Si es un error o un warning habrá que hacer scraping
                    return [estandares,tipo_texto];
                }
                return [0,2];
            }

            return [rows, score.textContent];
        });

        console.log(rows);
        console.log(score);
        //var informe['RESULTADO'] = score;

        for (row in tableRows){
            objeto_codigos_fallantes = {}
            const cols = row('td');
            divc = cols[1].querySelector('.collapsible-content');
            nivel = cols[2].textContent;
            nivel = nivel.replaceAll(' ','');
            console.log(nivel);
        }

        
        // Return data
        return [evaluationTableBody, score];
    },


    async acScraper(page, evaluationUrl){

        // Navigate to url
        await page.goto(this.acUrl);

        // Wait for input element to load
        await page.waitForSelector('#checkuri');

        // Load the url we want to evaluate and submit
        await page.focus('#checkuri');
        await page.keyboard.type(evaluationUrl);
        await page.click('#validate_uri');

        // Wait for results to be loaded
        await page.waitForSelector('fieldset[class="group_form"]', {timeout: 60000});

        // Get evaluation data
        const data = await page.evaluate(() => {
            const table = document.querySelector('fieldset[class="group_form"]');
            return table.innerHTML;
        });

        // Return data
        return data;
    }
}

module.exports = scraper;