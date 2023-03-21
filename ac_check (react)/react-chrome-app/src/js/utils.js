
import load_result_table from './results_table.js';


function getStoredJson(){
    var json = localStorage.getItem("json");
    return JSON.parse(json);
}

/** 
 * Function to store given json on extension localStorage
 */
function saveJson(json){
    localStorage.removeItem('json');
    localStorage.setItem("json",json);
    load_result_table();
    window.location.reload();
}






export function loadStoredReport(){
    try{
        var json = getStoredJson()
        var jsonTabla = localStorage.getItem("tabla_resultados");
        var main = localStorage.getItem("tabla_main");

        if (json != null && main != null){
            return {
                resultsSummary: JSON.parse(jsonTabla), 
                resultsContent: ""
            };
        } else{
            return {
                resultsSummary: "<div style='text-align: center; padding:15px 0;'>No data stored</div>",
                resultsContent: ""
            };
        }
    }catch (error){
        console.log(error);
    }
    
}


async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 60000 } = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    console.log("aaaa");

    const response = await fetch(resource, {
        ...options,
        mode: 'cors',
        method: 'POST', 
        headers: {"Content-Type": "application/json"},
        signal: controller.signal
    }).catch((error)=>{console.log(error)});

    
    console.log("bbbb");
    
    clearTimeout(timer);
    return response;
}

async function fetchScraper(bodyData) {
    const response = await fetchWithTimeout('http://localhost:8080/http://localhost:7070/getEvaluationJson', { body: bodyData });
    if (!response.ok) throw new Error("Error on fetching scraper server: " + response.status);
    const json = await response.json();
    return JSON.parse(json["body"]);
}

export async function getEvaluation(checkboxes, setIsLoading){

    const AM = checkboxes[0].checked;
    const AC = checkboxes[1].checked;
    const MV = checkboxes[2].checked;
    const A11Y = checkboxes[3].checked;
        
    if (AM || AC || MV){
        const bodyData = JSON.stringify({ "am": AM, "ac": AC, "mv":MV, "url": window.location.href, "title": window.document.title});
        
        var json = await fetchScraper(bodyData);

        /* if (A11Y){
        const a11y = a11y();
        merge(json, a11y);
        } */
        saveJson(JSON.stringify(json));

    }else if(A11Y){
        /* json = a11y();
        saveJson(json);*/
    }else{
        alert("You need to choose at least one analizer");
    }

    setIsLoading(false);

    return {
        resultsSummary: "<div style='text-align: center; padding-top: 15px;'>No data stored</div>",
        resultsContent: ""
    };
}





export function clearStoredEvaluationData(){
    if (!window.confirm("Are you sure you want to permanently delete current stored evaluation data?")) return;

    localStorage.removeItem("json");
    localStorage.removeItem("json_resultados");
    localStorage.removeItem("tabla_resultados");
    localStorage.removeItem("tabla_main");
    localStorage.removeItem("ultimo");
    window.location.reload();
}






export function uploadReport(event){

    var reader = new FileReader();
    reader.readAsText(event.target.files[0], "UTF-8");
    reader.onload = (event) => {
       /* var jsonT = localStorage.getItem("json");
        var savedJson = JSON.parse(jsonT);*/
        var json = JSON.parse(event.target.result);
        console.log(json);
        //if (savedJson != null) merge(json,savedJson);

        saveJson(JSON.stringify(json));
    }

}





export function downloadCurrentReport(activeLevels){

    if(localStorage.getItem("tabla_main")==null){
        alert("There is currently no evaluation data stored! Start by evaluating the page or uploading an existing report.");
        return;
    }

    var json = getStoredJson()

    json.evaluationScope.conformanceTarget = "wai:WCAG2" + activeLevels[activeLevels.length - 1] + "-Conformance"

    /*var interestedSamples = json.auditSample.filter(sample => activeLevels.includes(sample.conformanceLevel));
    json.auditSample = interestedSamples;*/

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
