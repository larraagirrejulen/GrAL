
import {getFromChromeStorage} from "./utils/chromeUtils";
import {getSuccessCriterias} from "./utils/wcagUtils";
import { storeNewReport } from "./evaluationOptions";



export async function removeCase(index, criteria){

    if(!window.confirm("Are you sure you want to remove this found case?")) return;

    const evaluationReport = await getFromChromeStorage("report", false);

    const criteriaTxt = getSuccessCriterias().find((elem) => elem.num === criteria.criteriaNumber);

    const reportCriteria = evaluationReport.auditSample.find((elem) => elem.test.includes(criteriaTxt.id));

    const removingFoundCase = criteria.hasPart[index];

    const foundCaseIndex = reportCriteria.hasPart.indexOf((elem) => elem.subject === removingFoundCase.webPage && elem.result.outcome.replace("earl:", "") === removingFoundCase.outcome)

    reportCriteria.hasPart.splice(foundCaseIndex, 1);

    criteria.hasPart.splice(index, 1);

    let newOutcome = "untested";

    for(let i = 0; i < criteria.hasPart.length; i++){
        const foundCase = criteria.hasPart[i];
        if(foundCase.webPage === window.location.href){
            newOutcome = foundCase.outcome;
            break;
        }
    };

    criteria.outcomes[window.location.href] = "earl:" + newOutcome;

    if(reportCriteria.hasPart.length === 0){

        reportCriteria.result.outcome = "earl:untested";
        reportCriteria.result.description = "";
        delete reportCriteria.assertedBy;
        delete reportCriteria.mode;

    }else{

        const outcomeDescriptions = {
            "earl:passed": ["No violations found", "PASSED:"],
            "earl:failed": ["Found a violation ...", "An ERROR was found:"],
            "earl:cantTell": ["Found possible applicable issue, but not sure...", "A POSSIBLE ISSUE was found:"],
            "earl:inapplicable": ["SC is not applicable", "Cannot apply:"]
        };

        reportCriteria.result.outcome = "earl:" + newOutcome;
        reportCriteria.result.description = outcomeDescriptions["earl:" + newOutcome];
    }

    storeNewReport(evaluationReport);

};