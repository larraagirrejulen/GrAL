
import { mapReportData } from './mapReportData.js';
import { storeOnChromeStorage, getFromChromeStorage, removeFromChromeStorage } from './utils/chromeUtils.js';
import { getSuccessCriterias } from './utils/wcagUtils.js';


/**
 * Stores a new report in the Chrome storage, maps the report data for the extension table, sets a flag in localStorage and reloads the page.
 * @async
 * @function storeNewReport
 * @param {Object} newReport - The report object to be stored in the Chrome storage.
 * @throws {Error} If there was an error storing the new report.
 */
export function storeNewReport(newReport){
    try{
        storeOnChromeStorage("report", newReport);
        mapReportData(newReport);
    } catch(error) {
        ["report", "siteSummary", "pageSummaries", "reportTableContent"].map((key) => removeFromChromeStorage(key));
        throw new Error("Error when storing or mapping the report => " + error);
    }
}


/**
 * Removes all stored report data from Chrome storage, clears the evaluated flag from localStorage and reloads the page.
 * @function removeStoredReport
 */
export function removeStoredReport(){
    
    if (!window.confirm("Unsaved reports will be lost. Continue?")) return;

    localStorage.removeItem("evaluated");

    ["report", "siteSummary", "pageSummaries", "reportTableContent"].map((key) => removeFromChromeStorage(key));

    window.location.reload();
}


/**
 * Reads and stores the contents of the uploaded report file, and stores it as a new report object.
 * @function uploadNewReport
 * @param {Object} uploadEvent - The upload event object, containing the file to be read.
 */
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

        storeNewReport(newReport);
    }

}


/**
 * Downloads the stored report data from Chrome storage, modifies it according to the active conformance levels and downloads it as a JSON file.
 * If there is no stored report data, it shows an alert message and does nothing.
 * @async
 * @function downloadStoredReport
 */
export async function downloadStoredReport(){

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


/**
 * Perform an evaluation based on given scope and selected analyzers.
 * @async
 * @function performEvaluation
 * @param {function} setIsLoading - Function to enable and disable loading animation.
 * @throws {Error} Throws an error if an error occurs during the evaluation process.
 * @returns {void}
 */
export async function performEvaluation(setAnimateBtn){

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

        const currentReport = await getFromChromeStorage("report", false);

        includeEditedFoundCases(newReport, currentReport);

        storeNewReport(newReport);

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


export async function storeReport(setAnimateBtn, authenticationState){

    try{
        setAnimateBtn("store");

        const currentReport = await getFromChromeStorage("report", false);

        const enableBlacklist = await getFromChromeStorage('enableBlacklist');
        
        if(enableBlacklist){
            await applyBlackList(currentReport);
        }

        const bodyData = JSON.stringify({report: currentReport, uploadedBy: authenticationState});

        const storeResults = await fetchServer(bodyData, "reportStoring");

        if(storeResults.success){
          window.alert("Report successfully stored!");
        } else {
          window.alert("Could not store the report, try again later...");
        }

    }catch(error){
        console.log(error);
    }finally{
      setAnimateBtn("none");
    }

  };


/**
 * Fetches the evaluation report from a server using a JSON body.
 * @async
 * @function fetchEvaluation
 * @param {string} bodyData - The JSON body containing the parameters for the evaluation report.
 * @param {number} [timeout=120000] - The timeout for the fetch request, in milliseconds.
 * @returns {Promise<object>} - The evaluation report as an object.
 * @throws {Error} If there was an error with the fetch request, or if the request timed out.
 */
export async function fetchServer(bodyData, action, timeout = 120000) {

    try {
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

        return JSON.parse(fetchData);

    } catch (error) {
        throw new Error("Error fetching scraping server => " + error.name === 'AbortError' ? 'fetch timed out!' : error.message)
    }

}


async function applyBlackList(currentReport){

    const successCriterias = getSuccessCriterias();
    const blacklist = await getFromChromeStorage("blacklist") ?? [];

    if(blacklist.length === 0){
        return;
    }

    for(let index = 0; index < currentReport.auditSample.length; index++){

        const criteria = currentReport.auditSample[index];

        const criteriaNumber = successCriterias[index].num;

        let outcome = "earl:untested";

        for (let i = 0; i < criteria.hasPart.length; i++) {

            const foundCase = criteria.hasPart[i];

            const blacklisteds = blacklist.filter(
                item => item.criteria.startsWith(criteriaNumber) && "earl:" + item.outcome === foundCase.result.outcome
            );

            if(blacklisteds.length > 0){

                for(const listed of blacklisteds){
                    const index = foundCase.assertedBy.findIndex(
                        item => item.assertor === listed.evaluator && item.description === listed.message
                    );
                    if(index !== -1){
                        foundCase.assertedBy.splice(index, 1);
                        if(foundCase.assertedBy.length === 0){
                            break;
                        }
                    }
                }

                if(foundCase.assertedBy.length > 0){

                    const newOutcome = foundCase.result.outcome;
    
                    if(outcome === "earl:untested" ||
                    (outcome === "earl:inapplicable" && newOutcome !== "earl:untested") ||
                    (outcome === "earl:passed" && (newOutcome === "earl:failed" || newOutcome === "earl:cantTell")) ||
                    (outcome === "earl:cantTell" && newOutcome === "earl:failed")){
                        outcome = newOutcome;
                    }
    
                    for (let j = 0; j < foundCase.result.locationPointersGroup.length; j++) {
    
                        const pointer = foundCase.result.locationPointersGroup[j];
    
                        for(const listed of blacklisteds){
                            const index = pointer.assertedBy.findIndex(item => item === listed.evaluator);
                            if(index !== -1){
                                pointer.assertedBy.splice(index, 1);
                                if(pointer.assertedBy.length === 0){
                                    break;
                                }
                            }
                        }  
    
                        if(pointer.assertedBy.length === 0){
                            foundCase.result.locationPointersGroup.splice(j, 1);
                            j--;
                        }
                    };
    
                }else{
    
                    criteria.hasPart.splice(i, 1);
                    i--;

                }
            }
        }

        if(criteria.hasPart.length === 0){

            criteria.result = {
                "outcome": "earl:untested",
                "description": ""
            }
            delete criteria.assertedBy;
            delete criteria.mode;

        } else {

            criteria.result.outcome = outcome;
            
        }
    }
}