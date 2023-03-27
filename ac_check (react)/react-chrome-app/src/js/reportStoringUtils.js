
import { load_result_table } from './displayReportData.js';



export function storeReport(report){
    localStorage.setItem("json",report);
    load_result_table();
    window.location.reload();
}



export function getStoredReport(){
    var json = localStorage.getItem("json");
    return JSON.parse(json);
}



export function loadStoredReport(){
    const jsonTabla = localStorage.getItem("tabla_resultados");
    const main = localStorage.getItem("tabla_main");

    return {
        resultsSummary: JSON.parse(jsonTabla) ?? "<div style='text-align: center; padding:15px 0;'>No data stored</div>", 
        resultsContent: JSON.parse(main) ?? ""
    }
}



export function removeStoredReport(){
    if (!window.confirm("Are you sure you want to permanently delete current stored evaluation data?")) return;

    localStorage.clear();
    window.location.reload();
}



export function uploadAndStoreReport(event){

    var reader = new FileReader();
    reader.readAsText(event.target.files[0], "UTF-8");
    reader.onload = (event) => {
        //var savedJson = getStoredReport();
        var json = JSON.parse(event.target.result);
        //if (savedJson != null) merge(json,savedJson);
        storeReport(JSON.stringify(json));
    }

}



export function downloadStoredReport(){

    if(localStorage.getItem("tabla_main")==null){
        alert("There is currently no evaluation data stored! Start by evaluating the page or uploading an existing report.");
        return;
    }

    var json = getStoredReport();

    const activeLevels = JSON.parse(localStorage.getItem("activeLevels"));

    json.evaluationScope.conformanceTarget = "wai:WCAG2" + activeLevels[activeLevels.length - 1] + "-Conformance"

    json.auditSample.forEach((audit) => {
        audit.hasPart.forEach((elem) => {
            elem.result.description = "\n\n----------------------------------\n\n" + elem.result.description;
        });
    });

    const data = JSON.stringify(json);
    const fileName = json.title + ".json";
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
