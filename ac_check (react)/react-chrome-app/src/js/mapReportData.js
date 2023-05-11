
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
    const reportSummary = getOutcomeVariables();

    for (var i = 0; i < auditSample.length; i++){

        const criteriaAssertion = auditSample[i];
        const conformanceLevel = criteriaAssertion.conformanceLevel;
        const outcome = criteriaAssertion.result.outcome;

        reportSummary[outcome][conformanceLevel]++;

        assertions[successCriterias[i].num] = {
            "conformanceLevel": conformanceLevel,
            "outcome" : outcome,
            "description": criteriaAssertion.result.description,
            "hasPart": criteriaAssertion.hasPart
        };
    }
    storeOnChromeStorage("reportSummary", reportSummary);
    
    const reportTableContent = [];
    const mainCategories = getWcagHierarchy("mainCategories");

    for(const categoryKey in mainCategories){

        const outcomes = getOutcomesByCategory(categoryKey);
        const subCategoryResults = getSubCategoryResults(categoryKey);

        reportTableContent.push({
            "categoryTitle": mainCategories[categoryKey],
            "subCategories": subCategoryResults,
            "passed": outcomes["earl:passed"],
            "failed": outcomes["earl:failed"],
            "cantTell": outcomes["earl:cantTell"],
            "inapplicable": outcomes["earl:inapplicable"],
            "untested": outcomes["earl:untested"]
        });

    }
    storeOnChromeStorage("reportTableContent", reportTableContent);

    localStorage.setItem("evaluated", "true");
    window.location.reload();

}




function getSubCategoryResults(categoryKey){

    const subCategoryResults = [];
    const subCategories = getWcagHierarchy(categoryKey);

    for(const subCategoryKey in subCategories){

        const outcomes = getOutcomesByCategory(subCategoryKey);
        const criteriaResults = getCriteriaResults(subCategoryKey);

        subCategoryResults.push({
            "subCategoryTitle": subCategories[subCategoryKey],
            "criterias": criteriaResults,
            "passed": outcomes["earl:passed"],
            "failed": outcomes["earl:failed"],
            "cantTell": outcomes["earl:cantTell"],
            "inapplicable": outcomes["earl:inapplicable"],
            "untested": outcomes["earl:untested"]
        });

    }
    return subCategoryResults;
}




function getCriteriaResults(subCategoryKey){

    const criteriaResults = [];
    const criterias = getWcagHierarchy(subCategoryKey);

    for(const criteriaKey in criterias){

        const criteriaResult = assertions[criteriaKey]; 

        const results = {
            "criteria": criterias[criteriaKey],
            "outcome": criteriaResult.outcome.replace("earl:", ""),
            "conformanceLevel": assertions[criteriaKey].conformanceLevel
        }

        if(criteriaResult.hasPart.length > 0){
            results.hasPart = getHasPart(criteriaKey);
        }

        criteriaResults.push(results);
    }

    return criteriaResults;
}




function getHasPart(criteriaKey){

    const foundCasesResults = [];
    const hasPart = assertions[criteriaKey].hasPart;

    for (const foundCase of hasPart) {

        // Ignorar los que no son de la página en la que se encuentra
        if(foundCase.subject !== window.location.href){
            continue;
        }

        const outcome = foundCase.result.outcome.replace("earl:", "");

        const hasPart = {
            "outcome": outcome,
            "descriptions": foundCase.assertedBy
        }

        const foundCasePointers = foundCase.result.locationPointersGroup;

        if(foundCasePointers.length > 0){

            const pointers = []

            for (const pointer of foundCasePointers) {
                
                let html = pointer['description'].replaceAll('<','&lt;');
                html = html.replaceAll('>','&gt;');

                pointers.push({
                    "html": html,
                    "path": pointer['ptr:expression'],
                    "innerText": pointer.innerText,
                    "assertedBy": pointer.assertedBy.sort()
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
    
    const outcomes = getOutcomeVariables();

    for (const criteriaNumber in assertions) {

        if (criteriaNumber.startsWith(categoryKey)){

            const assertion = assertions[criteriaNumber];
            outcomes[assertion.outcome][assertion.conformanceLevel]++;
        }
    }

    return outcomes;
}









