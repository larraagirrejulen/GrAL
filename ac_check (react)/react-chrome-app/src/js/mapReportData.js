
import { getSuccessCriterias, getWcagHierarchy } from './utils/wcagUtils.js'
import { storeOnChromeStorage }  from './utils/chromeUtils.js';


const assertions = {};

/**
 * Returns an object containing keys for each possible outcome type (passed, failed, cannotTell,
 * inapplicable, and untested), each with nested objects for accessibility levels A, AA, and AAA
 * with default values of 0.
 * @function getOutcomeVariables
*/
function getOutcomeVariables () {
    return{
        "earl:passed": { "A": 0, "AA": 0, "AAA": 0 },
        "earl:failed": { "A": 0, "AA": 0, "AAA": 0 },
        "earl:cantTell": { "A": 0, "AA": 0, "AAA": 0 },
        "earl:inapplicable": { "A": 0, "AA": 0, "AAA": 0 },
        "earl:untested": { "A": 0, "AA": 0, "AAA": 0 }
    };
}



/**
 * Maps the report data from Chrome storage to a format suitable for displaying in the extension UI table
 * and stores the resulting data in Chrome storage.
 * @async
 * @function mapReportData
 * @returns {void}
 */
export async function mapReportData(evaluationReport){

    const auditSample = evaluationReport.auditSample;
    const successCriterias = getSuccessCriterias();
    const siteSummary = getOutcomeVariables();
    const evaluationScope = [];
    
    const pageSummaries = {};
    for(const webPage of evaluationReport.structuredSample.webpage){
        pageSummaries[webPage.id] = getOutcomeVariables(); 
        evaluationScope.push(webPage.id);
    }

    for (var i = 0; i < auditSample.length; i++){

        const assertion = auditSample[i];
        const conformanceLevel = assertion.conformanceLevel;
        const hasPart = assertion.hasPart;

        siteSummary[assertion.result.outcome][conformanceLevel]++;

        const pageOutcomes = {};

        for(const webPage of evaluationReport.structuredSample.webpage){

            let pageOutcome = "earl:untested";

            for(const foundCase of hasPart){

                if(foundCase.subject !== webPage.id) continue;
                
                if(pageOutcome === "earl:failed") break;

                const newOutcome = foundCase.result.outcome;

                if(pageOutcome === "earl:untested" ||
                  (pageOutcome === "earl:inapplicable" && newOutcome !== "earl:untested") ||
                  (pageOutcome === "earl:passed" && (newOutcome === "earl:failed" || newOutcome === "earl:cantTell")) ||
                  (pageOutcome === "earl:cantTell" && newOutcome === "earl:failed")){
                    pageOutcome = newOutcome;
                }
                
            }

            pageSummaries[webPage.id][pageOutcome][conformanceLevel]++;

            pageOutcomes[webPage.id] = pageOutcome;
        }

        assertions[successCriterias[i].num] = {
            conformanceLevel,
            pageOutcomes,
            "description": assertion.result.description,
            hasPart
        };
    }
    storeOnChromeStorage("siteSummary", siteSummary);
    storeOnChromeStorage("pageSummaries", pageSummaries);

    storeOnChromeStorage("reportTableContent", getCategoryResults());

    localStorage.setItem("evaluated", "true");
    localStorage.setItem("evaluationScope", evaluationScope);
    window.location.reload();

}



function getCategoryResults(){

    const reportTableContent = [];
    const mainCategories = getWcagHierarchy("mainCategories");

    for(const categoryKey in mainCategories){
        reportTableContent.push({
            "categoryTitle": mainCategories[categoryKey],
            "subCategories": getSubCategoryResults(categoryKey),
            "webPageOutcomes": getPageOutcomesByCategory(categoryKey)
        });
    }

    return reportTableContent;
}



function getSubCategoryResults(categoryKey){

    const subCategoryResults = [];
    const subCategories = getWcagHierarchy(categoryKey);

    for(const subCategoryKey in subCategories){
        subCategoryResults.push({
            "subCategoryTitle": subCategories[subCategoryKey],
            "criterias": getCriteriaResults(subCategoryKey),
            "webPageOutcomes": getPageOutcomesByCategory(subCategoryKey)
        });
    }

    return subCategoryResults;
}



function getCriteriaResults(subCategoryKey){

    const criteriaResults = [];
    const criterias = getWcagHierarchy(subCategoryKey);

    for(const criteriaKey in criterias){

        const assertion = assertions[criteriaKey]; 

        const results = {
            "criteria": criterias[criteriaKey],
            "outcomes": assertion.pageOutcomes,
            "conformanceLevel": assertion.conformanceLevel
        }

        if(assertion.hasPart.length > 0){
            results.hasPart = getHasPart(criteriaKey);
        }

        criteriaResults.push(results);
    }

    return criteriaResults;
}




function getHasPart(criteriaKey){

    const foundCasesResults = [];
    const assertionHasPart = assertions[criteriaKey].hasPart;

    for (const foundCase of assertionHasPart) {

        const hasPart = {
            "outcome": foundCase.result.outcome.replace("earl:", ""),
            "descriptions": foundCase.assertedBy,
            "webPage": foundCase.subject
        }

        const foundCasePointers = foundCase.result.locationPointersGroup;

        if(foundCasePointers.length > 0){

            const pointers = []

            for (const pointer of foundCasePointers) {
                pointers.push({
                    "html": pointer['description'].replaceAll('<','&lt;').replaceAll('>','&gt;'),
                    "path": pointer['ptr:expression'],
                    "innerText": pointer.innerText,
                    "assertedBy": pointer.assertedBy.sort(),
                    "documentation": pointer.documentation
                })
            }

            const groupedPointers = pointers.reduce((acc, pointer) => {
                const key = pointer.assertedBy.sort().join(", ");
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(pointer);
                return acc;
            }, {});

            hasPart["groupedPointers"] = groupedPointers;
        }

        foundCasesResults.push(hasPart);
    }

    foundCasesResults.sort( (a, b) => {
        if ((a.outcome === "cantTell" && b.outcome === "failed") ||
            (a.outcome === "passed" && (b.outcome === "failed" || b.outcome === "cantTell")) ||
            (a.outcome === "inapplicable" && (b.outcome === "failed" || b.outcome === "cantTell" || b.outcome === "passed"))) {
            return 1;
        }else{
            return -1;
        }
    });

    return foundCasesResults;
}
  



function getPageOutcomesByCategory(categoryKey){
    
    const outcomes = {};
    for(const webPage in assertions["1.1.1"].pageOutcomes){
        outcomes[webPage] = getOutcomeVariables(); 
    }

    for (const criteriaNumber in assertions) {

        if (criteriaNumber.startsWith(categoryKey)){

            const assertion = assertions[criteriaNumber];

            for(const webPage in assertion.pageOutcomes){

                outcomes[webPage][assertion.pageOutcomes[webPage]][assertion.conformanceLevel]++;

            }
            
        }
    }

    return outcomes;
}









