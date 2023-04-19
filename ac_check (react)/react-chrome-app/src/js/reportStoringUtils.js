
import { mapResults2TableData } from './mapReport2Table.js';
import { storeOnChrome, getFromChromeStorage, removeFromChromeStorage } from './extensionUtils.js';



export function storeReport(report){
    storeOnChrome("report", report);
    mapResults2TableData();
    localStorage.setItem("evaluated", "true");
    window.location.reload();
}



export function removeStoredReport(){
    if (!window.confirm("Are you sure you want to permanently delete current stored evaluation data?")) return;

    localStorage.removeItem("evaluated");
    removeFromChromeStorage("report");
    removeFromChromeStorage("reportSummary");
    removeFromChromeStorage("reportTableContent");
    window.location.reload();
}



export function uploadAndStoreReport(event){

    const reader = new FileReader();
    reader.readAsText(event.target.files[0], "UTF-8");
    reader.onload = async (event) => {
        //const storedReport = await getFromChromeStorage("report");
        var report = JSON.parse(event.target.result);
        //if (savedJson != null) merge(report,storedReport);
        storeReport(report);
    }

}



export async function downloadStoredReport(){

    if(localStorage.getItem("evaluated") !== "true"){
        alert("There is currently no evaluation data stored! Start by evaluating the page or uploading an existing report.");
        return;
    }

    const storedReport = await getFromChromeStorage("report");

    const activeConformanceLevels = JSON.parse(localStorage.getItem("activeConformanceLevels"));

    storedReport.evaluationScope.conformanceTarget = "wai:WCAG2" + activeConformanceLevels[activeConformanceLevels.length - 1] + "-Conformance"

    storedReport.auditSample.forEach((audit) => {
        if(audit.result.outcome === "earl:untested"){
            audit.result.description += "\n\n----------------------------------\n\n";
            audit.hasPart.forEach((elem) => {
                elem.result.description += "\n\n----------------------------------\n\n";
            });
        }
    });

    const data = JSON.stringify(storedReport);
    const fileName = storedReport.title + ".json";
    const fileType = "text/json";

    const blob = new Blob([data], { type: fileType })

    const a = document.createElement('a')
    a.download = fileName
    a.href = window.URL.createObjectURL(blob)
    const clickEvt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
    })
    a.dispatchEvent(clickEvt)
    a.remove()

    if (window.confirm("Do you want to upload the report on W3C?")) window.open("https://www.w3.org/WAI/eval/report-tool/", '_blank');
}
