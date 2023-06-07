
import { mapReportData } from './mapReportData.js';
import { storeOnChromeStorage, getFromChromeStorage, removeFromChromeStorage } from './utils/chromeUtils.js';
import { applyBlackList, fetchServer } from "./utils/moreUtils.js";


export function loadReport(newReport){
    try{
        storeOnChromeStorage("report", newReport);
        mapReportData(newReport);
    } catch(error) {
        ["report", "siteSummary", "pageSummaries", "reportTableContent"].map((key) => removeFromChromeStorage(key));
        throw new Error("Error when storing or mapping the report => " + error);
    }
}

export function removeLoadedReport(){
    
    if (!window.confirm("Unsaved reports will be lost. Continue?")) return;

    localStorage.removeItem("evaluated");
    localStorage.removeItem("parentId");

    ["report", "siteSummary", "pageSummaries", "reportTableContent"].map((key) => removeFromChromeStorage(key));

    window.location.reload();
}

export function uploadNewReport(uploadEvent){

    if(localStorage.getItem("evaluated")) {
        if (!window.confirm("The upload will overwrite the current stored report. You want to continue?")) return;
    }

    const reader = new FileReader();

    reader.readAsText(uploadEvent.target.files[0], "UTF-8");
    
    reader.onload = async (uploadEvent) => {
        const newReport = JSON.parse(uploadEvent.target.result);

        const currentReport = await getFromChromeStorage("report", false);

        includeEditedFoundCases(newReport, currentReport);

        loadReport(newReport);
    }

}

export async function downloadLoadedReport(){

    const currentReport = await getFromChromeStorage("report", false);
    const activeConformanceLevels = JSON.parse(localStorage.getItem("conformanceLevels"));

    currentReport.evaluationScope.conformanceTarget = "wai:WCAG2" + activeConformanceLevels[activeConformanceLevels.length - 1] + "-Conformance";

    const untestedOutcome = {
        outcome: "earl:untested",
        description: "",
    };

    currentReport.auditSample.forEach((criteria) => {

        const conformanceLevel = criteria.conformanceLevel;

        if(!activeConformanceLevels.includes(conformanceLevel)){

            criteria.result = untestedOutcome;
            criteria.hasPart = [];
            delete criteria.assertedBy;
            delete criteria.mode;

        }else if(criteria.result.outcome === "earl:untested"){

            criteria.result.description += "\n\n----------------------------------\n\n";
            criteria.hasPart.forEach((elem) => {
                elem.result.description += "\n\n----------------------------------\n\n";
            });
        
        }
    });

    const enableBlacklist = await getFromChromeStorage('enableBlacklist');
        
    if(enableBlacklist){
        await applyBlackList(currentReport);
    }

    const fileName = currentReport.title + ".json";
    const fileType = "text/json";
    const blob = new Blob([JSON.stringify(currentReport)], { type: fileType })

    const a = document.createElement('a');
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob)
    a.dispatchEvent(new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
    }))
    a.remove()

    if (window.confirm("Do you want to upload the report on W3C?")){
        window.open("https://www.w3.org/WAI/eval/report-tool/", '_blank');
    } 
}

export async function evaluateScope(setAnimateBtn){

    try{
        setAnimateBtn("evaluate");

        const scope = JSON.parse(localStorage.getItem("scope"));
        if(scope.length === 0){
            alert("You need to set at least a web page as a scope");
            return;
        }

        const checkboxes = JSON.parse(localStorage.getItem("checkboxes"));
        const [am, ac, mv, a11y, pa, lh] = checkboxes.map(({ checked }) => checked);

        if([am, ac, mv, a11y, pa, lh].every(val => val === false)) {
            alert("You need to choose at least one analizer");
            return;
        }

        const bodyData = JSON.stringify({ am, ac, mv, a11y, pa, lh, scope });

        const newReport = await fetchServer(bodyData, "scrapeAccessibilityResults");

        const alreadyEvaluated = localStorage.getItem("evaluated");

        if(alreadyEvaluated){
            const currentReport = await getFromChromeStorage("report", false);
            includeEditedFoundCases(newReport, currentReport);
        }

        loadReport(newReport);

    } catch (error) {
        console.error("Error during evaluation process => ", error);
        alert("An error occurred during evaluation. Please try again.");
    } finally {
        setAnimateBtn("none");
    }

}


function includeEditedFoundCases(newReport, currentReport){

    for(let index = 0; index < currentReport.auditSample.length; index++){

        const editedCases = currentReport.auditSample[index].hasPart.filter(
            (foundCase) => foundCase.modifiedBy.length > 0
        );

        if(editedCases.length > 0){

            let worstOutcome = "earl:inapplicable";

            for(const editedCase of editedCases){

                newReport.auditSample[index].hasPart.push(editedCase);

                // Include assertor
                for(const assertor of editedCase.assertedBy){
                    if(newReport.assertors.findIndex(elem => elem["xmlns:name"] === assertor.assertor) === -1){
                        newReport.assertors.push(currentReport.assertors.find(
                            elem => elem["xmlns:name"] === assertor.assertor
                        ));
                    }
                }

                // Include scope
                if(newReport.structuredSample.webpage.findIndex(elem => elem.id === editedCase.subject) === -1){
                    newReport.structuredSample.webpage.push(currentReport.structuredSample.webpage.find(elem => elem.id === editedCase.subject))
                }

                const caseOutcome = editedCase.result.outcome;

                if((worstOutcome === "earl:inapplicable" && caseOutcome !== "earl:inapplicable") 
                || (worstOutcome === "earl:passed" && (caseOutcome === "earl:cantTell" || caseOutcome === "earl:failed"))
                || (worstOutcome === "earl:cantTell" && caseOutcome === "earl:failed")){

                    worstOutcome = caseOutcome;
        
                }
    
            }
            
            const newOutcome = newReport.auditSample[index].result.outcome;

            if(newOutcome === "earl:untested"){

                newReport.auditSample[index] = currentReport.auditSample[index];

            } else {

                if((newOutcome === "earl:inapplicable" && worstOutcome !== "earl:inapplicable") 
                || (newOutcome === "earl:passed" && (worstOutcome === "earl:cantTell" || worstOutcome === "earl:failed"))
                || (newOutcome === "earl:cantTell" && worstOutcome === "earl:failed")){

                    newReport.auditSample[index].result = currentReport.auditSample[index].result;
        
                }
            }

        }
    }

}









