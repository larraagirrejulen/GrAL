
import { getSuccessCriterias, getWcagHierarchy } from './wcagUtils.js'
import { getFromChromeStorage, storeOnChrome }  from './extensionUtils.js';


const dataByCriteria = {};


function initialiceOutcomeVariables(){
    return {
        "earl:passed": { "A": 0, "AA": 0, "AAA": 0 },
        "earl:failed": { "A": 0, "AA": 0, "AAA": 0 },
        "earl:cantTell": { "A": 0, "AA": 0, "AAA": 0 },
        "earl:inapplicable": { "A": 0, "AA": 0, "AAA": 0 },
        "earl:untested": { "A": 0, "AA": 0, "AAA": 0 }
    }
}



export async function mapResults2TableData(){

    const storedReport = await getFromChromeStorage("report");
    const resultsByCriteria = storedReport.auditSample;
    const criterias = getSuccessCriterias();
    const reportSummary = initialiceOutcomeVariables();

    for (var i = 0; i < resultsByCriteria.length; i++){

        const conformanceLevel = criterias[i].conformanceLevel;
        const criteriaResult = resultsByCriteria[i];
        const outcome = criteriaResult.result.outcome;

        reportSummary[outcome][conformanceLevel]++;

        dataByCriteria[criterias[i].num] = {
            "conformanceLevel": conformanceLevel,
            "outcome" : outcome,
            "description": criteriaResult.result.description,
            "foundCases": criteriaResult.hasPart
        };
    }
    storeOnChrome("reportSummary", reportSummary);
    
    const reportTableContent = [];
    const mainCategories = getWcagHierarchy("mainCategories");

    for(const categoryKey in mainCategories){
        
        const categoryData = getOutcomesByCategory(categoryKey);
        const subCategoryResults = getSubCategoryResults(categoryKey);

        reportTableContent.push({
            "categoryTitle": mainCategories[categoryKey],
            "subCategories": subCategoryResults,
            "passed": categoryData["earl:passed"],
            "failed": categoryData["earl:failed"],
            "cantTell": categoryData["earl:cantTell"],
            "inapplicable": categoryData["earl:inapplicable"],
            "untested": categoryData["earl:untested"]
        });

    }
    storeOnChrome("reportTableContent", reportTableContent);
}




function getSubCategoryResults(categoryKey){

    const subCategoryResults = [];
    const subCategories = getWcagHierarchy(categoryKey);

    for(const subCategoryKey in subCategories){

        const subCategoryData = getOutcomesByCategory(subCategoryKey);
        const criteriaResults = getCriteriaResults(subCategoryKey);

        subCategoryResults.push({
            "subCategoryTitle": subCategories[subCategoryKey],
            "criterias": criteriaResults,
            "passed": subCategoryData["earl:passed"],
            "failed": subCategoryData["earl:failed"],
            "cantTell": subCategoryData["earl:cantTell"],
            "inapplicable": subCategoryData["earl:inapplicable"],
            "untested": subCategoryData["earl:untested"]
        });

    }
    return subCategoryResults;
}




function getCriteriaResults(subCategoryKey){

    const criteriaResults = [];
    const criterias = getWcagHierarchy(subCategoryKey);

    for(const criteriaKey in criterias){

        const criteriaResult = dataByCriteria[criteriaKey]; 

        const results = {
            "criteria": criterias[criteriaKey],
            "outcome": criteriaResult.outcome.replace("earl:", ""),
            "conformanceLevel": dataByCriteria[criteriaKey].conformanceLevel
        }

        if(criteriaResult['foundCases'].length > 0){
            results["hasPart"] = getFoundCases(criteriaKey);
        }

        criteriaResults.push(results);
    }

    return criteriaResults;
}




function getFoundCases(criteriaKey){

    const foundCasesResults = [];
    const foundCases = dataByCriteria[criteriaKey]['foundCases'];

    for (const foundCase of foundCases) {

        const outcome = foundCase.result.outcome.replace("earl:", "");

        const hasPart = {
            "outcome": outcome,
            "descriptions": foundCase.assertedBy
        }

        const foundCasePointers = foundCase.result.locationPointersGroup;

        if(foundCasePointers.length > 0){

            hasPart["pointers"] = []

            for (const pointer of foundCasePointers) {
                
                let html = pointer['description'].replaceAll('<','&lt;');
                html = html.replaceAll('>','&gt;');

                hasPart["pointers"].push({
                    "html": html,
                    "xpath": pointer['ptr:expression']
                })
            }
        }

        foundCasesResults.push(hasPart);
    }

    foundCasesResults.sort(function(a, b) {
        if (a.outcome === "failed") {
            return -1; // a should come before b
        } else if (a.outcome === "cantTell") {
            if (b.outcome === "failed") {
                return 1; // b should come before a
            } else {
                return -1; // a should come before b
            }
        } else if(a.outcome === "passed"){ // a.outcome === "pass"
            if (b.outcome === "failed" || b.outcome === "cantTell") {
                return 1; // b should come before a
            } 
        } else{ // a.outcome === "inapplicable"
            if (b.outcome === "failed" || b.outcome === "cantTell" || b.outcome === "passed") {
                return 1; // b should come before a
            } 
        }
        return 0;
      });

    return foundCasesResults;
}
  



function getOutcomesByCategory(categoryKey){
    
    const outcomes = initialiceOutcomeVariables();

    for (const criteriaNumber in dataByCriteria) {
        if (criteriaNumber.startsWith(categoryKey)){
            const data = dataByCriteria[criteriaNumber];
            outcomes[data.outcome][data.conformanceLevel]++;
        }
    }

    return outcomes;
}









