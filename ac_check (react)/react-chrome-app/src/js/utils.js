

export function loadStoredReport(){

    var jsonT = localStorage.getItem("json");
    var jsonTabla = localStorage.getItem("tabla_resultados");
    var json = JSON.parse(jsonT);
    var main = localStorage.getItem("tabla_main");

    if (json != null && main != null){
        return {resultsSummary: jsonTabla, resultsContent: main};
    } else{
        return {
            resultsSummary: "<div style='text-align: center; padding-top: 15px;'>No data stored</div>",
            resultsContent: ""
        };
    }
}





async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 60000 } = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        mode: "cors",
        method: 'POST', 
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        signal: controller.signal
    });
    clearTimeout(timer);
    return response;
}

async function fetchScraper(bodyData) {
    const response = await fetchWithTimeout('http://localhost:8080/http://localhost:7070/getEvaluationJson', { body: bodyData });
    if (!response.ok) throw new Error("Error on fetching scraper server: " + response.status);
    const json = await response.json();
    return JSON.stringify(json["body"], null, 2);
}

export async function getEvaluation(checkboxes, setIsLoading){

    const AM = checkboxes[0].checked;
    const AC = checkboxes[1].checked;
    const MV = checkboxes[2].checked;
    const A11Y = checkboxes[3].checked;
    console.log(AM, AC, MV, A11Y);

    if (AM || AC || MV){
        const bodyData = JSON.stringify({ "am": AM, "ac": AC, "mv":MV, "url": window.location.href});
        var json = await fetchScraper(bodyData);
        console.log(json);

        /*localStorage.removeItem('json');
        if (A11Y){
        const a11y = a11y();
        merge(json, a11y);
        } 
        saveJson(json);*/

    }else if(A11Y){
        /* localStorage.removeItem('json');
        json = a11y();
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






export function downloadCurrentReport(){
    if(localStorage.getItem("tabla_main")==null){
        alert("There is currently no evaluation data stored! Start by evaluating the page or uploading an existing report.");
        return;
    }

    var jsonT = localStorage.getItem("json");
    var json = JSON.parse(jsonT);

    const data = JSON.stringify(json);
    const fileName = json.defineScope.scope.title + ".json";
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







/*export function addListeners(){
    console.log("aaaaaaaaaaaaaaaaa");
    var elements1 = document.getElementsByClassName(".collapsible_tabla");
    var elements2 = document.getElementsByClassName(".collapsible_tabla");
    var elements3 = document.getElementsByClassName(".collapsible_tabla");
    console.log(elements1);
    for (var i = 0; i < elements1.length; i++) {
        elements1[i].addEventListener('click', collapsible1);
    }
    for (var i = 0; i < elements2.length; i++) {
        elements2[i].addEventListener('click', collapsible2);
    }
    for (var i = 0; i < elements3.length; i++) {
        elements3[i].addEventListener('click', collapsible3);
    }
}*/


/**
 * Listener for clicking on an element of the results
 */
function collapsible1(elem){
    console.log("aaaaaaaaa");
    elem.classList.toggle("active");
    var content = elem.nextElementSibling;
    if (content.style.display === "block") {
    content.style.display = "none";
    } else {
    content.style.display = "block";
    }
}

/**
 * Listener for clicking on a sub-element of the results
 */
function collapsible2(elem){
    elem.classList.toggle("active");
    var content = elem.nextElementSibling;
    if (content.style.display === "block") {
    content.style.display = "none";
    } else {
    content.style.display = "block";
    }
}

/**
 * Listener for clicking on a sub-sub-element of the results
 */
/*function collapsible3(elem){
    let foto_ele = $(elem).find('img')[0];
    if (typeof foto_ele !== 'undefined') {   
        console.log(foto_ele) 
        let actual_src = foto_ele.getAttribute('src'); 
        console.log(actual_src) 
        if(actual_src === "" || actual_src === getArrowSrc()){
        foto_ele.setAttribute('src', getArrowUpSrc());
        }else{
        foto_ele.setAttribute('src', getArrowSrc());
        }
        var content = elem.nextElementSibling;
        if (content.style.display === "block") {
        content.style.display = "none";
        } else {
        content.style.display = "block";
        }
    }
}*/