
import { getPrincipleGuidelines, getWcagPrinciples, getSuccessCriteriasInfo, getGuidelineSuccessCriteria } from './utils/wcagUtils';
import { storeOnChromeStorage, getFromChromeStorage }  from './utils/chromeUtils';
import { WcagPrincipleId, EarlOutcome, WcagGuidelineId, WcagSuccessCriteriaId, BlackListedElement, BlackList, ConformanceLevel } from '../types/customTypes';
import { EvaluationReport, FoundCase } from '../types/evaluationReport';


const assertions: any = {};
var blacklist: BlackListedElement[];
var evaluationReport: EvaluationReport;

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
 * Maps the data of the currently loaded report for displaying it on the extension table taking into account blacklisted elements.
 * @param {Object} evaluationreport - The evaluation report (optional).
 * @param {Array} blackList - The blacklist (optional).
 * @returns {Promise<void>} - A Promise that resolves when the mapping is completed.
 */
export async function mapReportData(evaluationreport? : EvaluationReport, blackList? : BlackList){

    evaluationReport = evaluationreport ? evaluationreport : await getFromChromeStorage(window.location.hostname);

    const enableBlacklist: boolean = await getFromChromeStorage('enableBlackList', true);

    if(enableBlacklist){
        blacklist = blackList ? blackList : await getFromChromeStorage("blackList", true) ?? [];
    }else{
        blacklist = [];
    }

    const auditSample = evaluationReport.auditSample;
    const successCriterias = getSuccessCriteriasInfo();
    const siteSummary = getOutcomeVariables();
    const evaluationScope = [];
    
    const pageSummaries: any = {};
    for(const webPage of evaluationReport.structuredSample.webpage){
        pageSummaries[webPage.id] = getOutcomeVariables(); 
        evaluationScope.push(webPage.id);
    }

    for (var i = 0; i < auditSample.length; i++){

        const assertion = auditSample[i];
        const conformanceLevel = assertion.conformanceLevel;
        const hasPart = assertion.hasPart;
        const criteriaNumber = successCriterias[i].num;

        const pageOutcomes: any = {};

        let siteOutcome: EarlOutcome = "earl:untested";

        for(const webPage of evaluationReport.structuredSample.webpage){

            let pageOutcome: EarlOutcome = "earl:untested";

            for(const foundCase of hasPart){

                if(foundCase.subject !== webPage.id) continue;

                const blacklisteds = blacklist.filter(item => "earl:" + item.outcome === foundCase.result.outcome && item.criteria.startsWith(criteriaNumber));

                if(blacklisteds.length > 0){
                    const assertors = foundCase.assertedBy;

                    for(const listed of blacklisteds){
                        const index = assertors.findIndex((item:any) => item.assertor === listed.evaluator && item.description === listed.message);
                        if(index > -1){
                            assertors.splice(index, 1);
                            if(assertors.length === 0){
                                break;
                            }
                        }
                    }
                    if(assertors.length === 0) continue;
                }
                
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

            if(siteOutcome === "earl:untested" ||
              (siteOutcome === "earl:inapplicable" && pageOutcome !== "earl:untested") ||
              (siteOutcome === "earl:passed" && (pageOutcome === "earl:failed" || pageOutcome === "earl:cantTell")) ||
              (siteOutcome === "earl:cantTell" && pageOutcome === "earl:failed")){
                siteOutcome = pageOutcome;
            }
        }

        siteSummary[siteOutcome][conformanceLevel]++;

        assertions[criteriaNumber] = {
            conformanceLevel,
            pageOutcomes,
            "description": assertion.result.description,
            hasPart
        };
    }

    storeOnChromeStorage(`${window.location.hostname}.siteSummary`, siteSummary);
    storeOnChromeStorage(`${window.location.hostname}.pageSummaries`, pageSummaries);
    storeOnChromeStorage(`${window.location.hostname}.reportTableContent`, await getWcagResults());

    storeOnChromeStorage(`${window.location.hostname}.reportIsLoaded`, true);
    //localStorage.setItem("scope", JSON.stringify(evaluationScope));
    window.location.reload();

}

/**
 * Gets the principle results for the report table.
 * @returns {Array} - An array of category results.
 */
async function getWcagResults(){

    const wcagPrinciples: { [key in WcagPrincipleId]: string; } = getWcagPrinciples();

    const wcagResultsPromises = Object.keys(wcagPrinciples).map(async (principle) => {
        const principleId = principle as WcagPrincipleId;
    
        return {
            "principle": wcagPrinciples[principleId],
            "guidelinesResults": getPrincipleResults(principleId),
            "webPageOutcomes": getPageOutcomesByCategory(principleId)
        };
      });
    
      const wcagResults = await Promise.all(wcagResultsPromises);

    return wcagResults;
}


/**
 * Gets the sub-category results for a specific category.
 * @param {WcagPrincipleId} principle - The key of the category.
 * @returns {Array} - An array of sub-category results.
 */
function getPrincipleResults(principle: WcagPrincipleId){

    const principleResults = [];
    const guidelines:any = getPrincipleGuidelines(principle);

    for(const guideline in guidelines){
        const guidelineId = guideline as WcagGuidelineId
        principleResults.push({
            "subCategoryTitle": guidelines[guidelineId],
            "criterias": getGuidelineResults(guidelineId),
            "webPageOutcomes": getPageOutcomesByCategory(guidelineId)
        });
    }

    return principleResults;
}


/**
 * Gets the criteria results for a specific sub-category.
 * @param {WcagGuidelineId} guideline - The key of the sub-category.
 * @returns {Array} - An array of criteria results.
 */
function getGuidelineResults(guideline: WcagGuidelineId){

    const guidelineResults = [];
    const guidelineCriterias:any = getGuidelineSuccessCriteria(guideline);

    for(const successCriteria in guidelineCriterias){
        const successCriteriaId = successCriteria as WcagSuccessCriteriaId

        const assertion = assertions[successCriteriaId]; 

        const results: any = {
            "criteria": guidelineCriterias[successCriteriaId],
            "criteriaNumber": successCriteriaId as WcagSuccessCriteriaId,
            "outcomes": assertion.pageOutcomes,
            "conformanceLevel": assertion.conformanceLevel
        }

        if(assertion.hasPart.length > 0){
            results["hasPart"] = getSuccessCriteriaResults(successCriteriaId);
        }

        guidelineResults.push(results);
    }

    return guidelineResults;
}



/**
 * Gets the "hasPart" results for a specific criteria.
 * @param {WcagScuccessCriteriaId} successCriteria - The key of the criteria.
 * @returns {Array} - An array of "hasPart" results.
 */
function getSuccessCriteriaResults(successCriteria: WcagSuccessCriteriaId){

    const successCriteriaResults = [];
    const assertionHasPart = assertions[successCriteria].hasPart;

    for (const foundCase of assertionHasPart) {

        const descriptions = foundCase.assertedBy;

        const blacklisteds = blacklist.filter(item => "earl:" + item.outcome === foundCase.result.outcome && item.criteria.startsWith(successCriteria));

        if(blacklisteds.length > 0){

            for(const listed of blacklisteds){
                const index = descriptions.findIndex((item:any) => item.assertor === listed.evaluator && item.description === listed.message);
                if(index > -1){
                    descriptions.splice(index, 1);
                    if(descriptions.length === 0){
                        break;
                    }
                }
            }

            if(descriptions.length === 0) continue;

        }

        const hasPart:any = {
            outcome: foundCase.result.outcome.replace("earl:", ""),
            descriptions,
            webPage: foundCase.subject
        }

        const foundCasePointers = foundCase.result.locationPointersGroup;

        if(foundCasePointers.length > 0){

            const pointers = []

            for (const pointer of foundCasePointers) {

                for(const listed of blacklisteds){
                    const index = pointer.assertedBy.findIndex((item:any) => item === listed.evaluator);
                    if(index > -1){
                        pointer.assertedBy.splice(index, 1);
                        if(pointer.assertedBy.length === 0){
                            break;
                        }
                    }
                }

                if(pointer.assertedBy.length > 0){
                    pointers.push({
                        "html": pointer['description'].replaceAll('<','&lt;').replaceAll('>','&gt;'),
                        "path": pointer['ptr:expression'],
                        "innerText": pointer.innerText,
                        "assertedBy": pointer.assertedBy.sort(),
                        "documentation": pointer.documentation
                    });
                }
                
            }
 
            if(pointers.length === 0) continue;

            const groupedPointers = pointers.reduce((acc:any, pointer) => {
                const key = pointer.assertedBy.sort().join(", ");
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(pointer);
                return acc;
            }, {});

            hasPart["groupedPointers"] = groupedPointers;
        }

        successCriteriaResults.push(hasPart);
    }

    successCriteriaResults.sort( (a, b) => {
        if ((a.outcome === "cantTell" && b.outcome === "failed") ||
            (a.outcome === "passed" && (b.outcome === "failed" || b.outcome === "cantTell")) ||
            (a.outcome === "inapplicable" && (b.outcome === "failed" || b.outcome === "cantTell" || b.outcome === "passed"))) {
            return 1;
        }else{
            return -1;
        }
    });

    return successCriteriaResults;
}
  


/**
 * Gets the page outcomes by category.
 * @param {string} categoryKey - The key of the category.
 * @returns {Object} - The page outcomes by category.
 */
function getPageOutcomesByCategory(category: WcagPrincipleId | WcagGuidelineId){

    const outcomes:any = {};
    for(const webPage in evaluationReport.structuredSample.webpage){
        outcomes[webPage] = getOutcomeVariables(); 
    }

    for (const criteriaNumber in assertions) {

        if (criteriaNumber.startsWith(category)){

            const assertion = assertions[criteriaNumber];

            for(const webPage in assertion.pageOutcomes){

                outcomes[webPage][assertion.pageOutcomes[webPage]][assertion.conformanceLevel]++;

            }
            
        }
    }

    return outcomes;
}









