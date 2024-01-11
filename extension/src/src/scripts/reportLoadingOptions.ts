
import { ConformanceLevel, Evaluator, ServerAction } from '../types/customTypes';
import { Assertion, EvaluationReport, LocationPointer, Result } from '../types/evaluationReport';
import { mapReportData } from './mapReportData';
import { storeOnChromeStorage, getFromChromeStorage, removeFromChromeStorage } from './utils/chromeUtils';
import { applyBlackList } from "./utils/moreUtils";


/**
 * Loads a new report.
 * @param {EvaluationReport} newEvaluationReport - The new evaluation report to be loaded.
 * @throws {Error} Throws an error if there is an issue with storing or mapping the evaluation report.
 */
export function loadReport(newEvaluationReport: EvaluationReport){

    try{
        storeOnChromeStorage(window.location.hostname, newEvaluationReport);
        mapReportData(newEvaluationReport);
    } catch(error) {
        throw new Error(`Error when storing or mapping the report => ${error}`);
    }
}

/**
 * Removes the loaded report.
 */
export function removeLoadedReport(){
    
    if (!window.confirm("Unsaved reports will be lost. Continue?")) return;

    removeFromChromeStorage(`${window.location.hostname}.parentId`);
    removeFromChromeStorage(`${window.location.hostname}.reportIsLoaded`);

    const currentWebsite = window.location.hostname;

    [currentWebsite, `${currentWebsite}.siteSummary`, `${currentWebsite}.pageSummaries`, `${currentWebsite}.reportTableContent`].map((storageKey: any) => removeFromChromeStorage(storageKey));

    window.location.reload();
}

/**
 * Uploads a new report.
 * @param {React.ChangeEvent<HTMLInputElement>} uploadEvent - The upload event containing the new report.
 */
export async function uploadNewReport(uploadEvent: React.ChangeEvent<HTMLInputElement>){

    const reportLoaded: boolean = await getFromChromeStorage(`${window.location.hostname}.reportIsLoaded`);

    if(reportLoaded) {
        if (!window.confirm("The upload will overwrite the current stored report. You want to continue?")) return;
    }

    const uploadedFileReader = new FileReader();

    if(uploadEvent.target && uploadEvent.target.files){
        uploadedFileReader.readAsText(uploadEvent.target.files[0], "UTF-8");
        
        uploadedFileReader.onload = async (uploadEvent) => {
            const newReport: EvaluationReport = JSON.parse(uploadEvent.target?.result as string);

            const currentReport: EvaluationReport = await getFromChromeStorage(window.location.hostname);

            includeEditedFoundCases(newReport, currentReport);

            loadReport(newReport);
        }   
    }else {
        window.alert("Error uploading the file... Please try again");
    }


}


/**
 * Downloads the loaded report.
 */
export async function downloadLoadedReport(){

    const currentReport: EvaluationReport = await getFromChromeStorage(window.location.hostname);
    const activeConformanceLevels: ConformanceLevel[] = JSON.parse(localStorage.getItem("conformanceLevels") ?? '["A","AA"]');

    currentReport.evaluationScope.conformanceTarget = `wai:WCAG2${activeConformanceLevels[activeConformanceLevels.length - 1]}-Conformance`;

    const untestedOutcome: Result = {
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
            criteria.hasPart.forEach((foundCase) => {
                foundCase.result.description += "\n\n----------------------------------\n\n";
            });
        
        }
    });

    const enableBlacklist: boolean = await getFromChromeStorage('enableBlackList', true);
        
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

/**
 * Evaluates the scope.
 * @param {React.Dispatch<React.SetStateAction<string>>} setAnimateBtn - The function to set the animate button state.
 */
export async function evaluateScope(setAnimateBtn: React.Dispatch<React.SetStateAction<string>>){

    const scope: {name: string, url: string}[] = JSON.parse(localStorage.getItem("scope") as string);

    const checkboxes: [{checked: boolean, label: string, href: string}] = JSON.parse(localStorage.getItem("checkboxes") as string);
    const [am, ac, mv, a11y, pa, lh] = checkboxes.map(({ checked }) => checked);

    if([am, ac, mv, a11y, pa, lh].every(val => val === false)) {
        alert("You need to choose at least one analizer");
        return;
    }

    setAnimateBtn("evaluate");

    const bodyData = JSON.stringify({ am, ac, mv, a11y, pa, lh, scope });

    fetchServer(bodyData, "evaluation")
    .then( async (result) => {
        const newReport = result as EvaluationReport
        const reportLoaded = await getFromChromeStorage(`${window.location.hostname}.reportIsLoaded`);
        if(reportLoaded === "true"){
            const currentReport: EvaluationReport = await getFromChromeStorage(window.location.hostname);
            includeEditedFoundCases(newReport, currentReport);
        }
        console.log(newReport);
        loadReport(newReport);
    })
    .catch((err) => {
        console.error("Error during evaluation process => ", err);
        alert("An error occurred during evaluation. Please try again.");
    })
    .finally(() => setAnimateBtn("none"));

}

/**
 * Fetches data from the server.
 *
 * @param {BodyInit} bodyData - The data to send in the request body.
 * @param {ServerAction} action - The server action to perform.
 * @param {number} [timeout=180000] - The timeout value in milliseconds.
 * @returns {Promise<Object>} A promise that resolves to the fetched data.
 */
function fetchServer(bodyData: BodyInit, action: ServerAction, timeout = 180000) {

    return new Promise(async (resolve, reject) => {
        try{
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeout);

            const response = await fetch('http://localhost:7070/' + action, {
                body: bodyData,
                method: "POST",
                headers: {"Content-Type": "application/json"},
                signal: controller.signal
            });
            
            clearTimeout(timer);

            if (!response.ok) throw new Error("HTTP error! Status: " + response.status);
            
            const fetchData = await response.json();

            resolve(JSON.parse(fetchData));
        }catch(err){
            reject(err);
        }

    });

}

/**
 * Includes edited found cases from the current report into the new report.
 * @param {Object} newReport - The new report to include the edited found cases.
 * @param {Object} currentReport - The current report containing the edited found cases.
 */
export function includeEditedFoundCases(newReport: EvaluationReport, currentReport: EvaluationReport){

    for(let index = 0; index < currentReport.auditSample.length; index++){

        const currentCriteriaResult = currentReport.auditSample[index];

        for(let j = 0; j < currentCriteriaResult.hasPart.length; j++){

            const currentFoundCase = currentCriteriaResult.hasPart[j];

            const editedAssertors = currentFoundCase.assertedBy.filter(
                (assertor) => assertor.modifiedBy.length > 0
            );

            if(editedAssertors.length > 0){
                
                const newFoundCase = newReport.auditSample[index].hasPart.find((newFoundCase) => 
                    newFoundCase.subject === currentFoundCase.subject && newFoundCase.result.outcome === currentFoundCase.result.outcome
                );

                const foundCaseTemplate:any = {
                    "type": "Assertion",
                    "testcase": currentFoundCase.testcase,
                    "assertedBy": [] as Assertion[],
                    "subject": currentFoundCase.subject,
                    "mode": "earl:automatic",
                    "result":
                    {
                        "outcome": currentFoundCase.result.outcome,
                        "description": currentFoundCase.result.description,
                        "locationPointersGroup": []
                    }
                };



                const currentPointers = currentFoundCase.result.locationPointersGroup;

                // Include assertor
                for(const assertor of editedAssertors){
                    if(newReport.assertors.findIndex(elem => elem["xmlns:name"] === assertor.assertor) === -1){

                        const newAssertor: any = currentReport.assertors.find(
                            (currentAssertor) => currentAssertor["xmlns:name"] === assertor.assertor
                        );
                    
                        if (newAssertor) {
                            newReport.assertors.push(newAssertor);
                        }
                    }

                    if(!newFoundCase){

                        foundCaseTemplate.assertedBy.push(assertor);

                        for(const pointer of currentPointers){

                            if(!pointer.assertedBy.includes(assertor.assertor)) continue;

                            const templatePointer: any = foundCaseTemplate.result.locationPointersGroup.find(
                                (pointr: any) => pointr["ptr:expression"] === pointer["ptr:expression"]
                            )

                            if(templatePointer){
                                templatePointer.assertedBy.push(assertor)
                            }else{
                                foundCaseTemplate.result.locationPointersGroup.push(pointer);
                            }

                        }

                    }else{

                        const assertorIndex = newFoundCase.assertedBy.findIndex((elem) => elem.assertor === assertor.assertor);

                        if(assertorIndex !== -1){
                            const newAssertor = newFoundCase.assertedBy[assertorIndex];
                            newAssertor.description = assertor.description;
                            newAssertor.modifiedBy = assertor.modifiedBy;
                            newAssertor.lastModifier = assertor.lastModifier;
                        }else{
                            newFoundCase.assertedBy.push(assertor);
                        }

                        const newPointers = newFoundCase.result.locationPointersGroup;

                        for(const pointer of currentPointers){

                            if(!pointer.assertedBy.includes(assertor.assertor)) continue;

                            const newPointerIndex = newPointers.findIndex((elem) => 
                                elem["ptr:expression"] === pointer["ptr:expression"] || elem.description === pointer.description
                            )

                            if(newPointerIndex !== -1){
                                const newPointerAssertors = newFoundCase.result.locationPointersGroup[newPointerIndex].assertedBy;

                                if(!newPointerAssertors.includes(assertor.assertor)){
                                    newFoundCase.result.locationPointersGroup[newPointerIndex].assertedBy.push(assertor.assertor);
                                }
                            }else{
                                newFoundCase.result.locationPointersGroup.push(pointer);
                            }

                        }

                    }
                    
                }

                if(!newFoundCase){

                    newReport.auditSample[index].hasPart.push(foundCaseTemplate);

                    const currentOutcome = currentFoundCase.result.outcome;
                    const newOutcome = newReport.auditSample[index].result.outcome;

                    if(newOutcome === "earl:untested"
                    ||(newOutcome === "earl:inapplicable" && currentOutcome !== "earl:inapplicable") 
                    ||(newOutcome === "earl:passed" && (currentOutcome === "earl:cantTell" || currentOutcome === "earl:failed"))
                    ||(newOutcome === "earl:cantTell" && currentOutcome === "earl:failed")){

                        newReport.auditSample[index].result.outcome = currentOutcome;
                    }
                }

                // Include scope
                if(newReport.structuredSample.webpage.findIndex(elem => elem.id === currentFoundCase.subject) === -1){
                    newReport.structuredSample.webpage.push(currentReport.structuredSample.webpage.find(elem => elem.id === currentFoundCase.subject) ?? {id: ""})
                }
            }
        }
    }
}









