/* eslint-disable no-undef */

import { storeReport } from './reportStoringUtils.js';



async function fetchEvaluation(bodyData, timeout = 120000) {

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch('http://localhost:8080/http://localhost:7070/getEvaluationJson', {
            body: bodyData,
            mode: 'cors',
            method: 'POST', 
            headers: {"Content-Type": "application/json"},
            signal: controller.signal
        });
        
        clearTimeout(timer);

        if (!response.ok){
            throw new Error("HTTP error! Status: " + response.status);
        } 

        const json = await response.json();

        return JSON.parse(json["body"]);

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
}



export async function performEvaluation(){

    const checkboxes = JSON.parse(sessionStorage.getItem("checkboxes"));

    const AM = checkboxes[0].checked;
    const AC = checkboxes[1].checked;
    const MV = checkboxes[2].checked;
    const A11Y = checkboxes[3].checked;
    const TA11Y = checkboxes[4].checked;
        
    if(AM || AC || MV){

        const bodyData = JSON.stringify({ "am": AM, "ac": AC, "mv":MV, "url": window.location.href, "title": window.document.title});
        let fetchEvaluationReport = await fetchEvaluation(bodyData);

        if (A11Y || TA11Y){
            chrome.runtime.sendMessage({ action: "performEvaluation", "a11y":A11Y, "ta11y":TA11Y }, (response)=>{
                const localEvaluationReport = response.report[0].result;
                merge(fetchEvaluationReport, localEvaluationReport);
                storeReport(fetchEvaluationReport);
            });
        }else{
            storeReport(fetchEvaluationReport);
        }
        

    }else if(A11Y || TA11Y){

        chrome.runtime.sendMessage({ action: "performEvaluation", "a11y":A11Y, "ta11y":TA11Y }, (response)=>{
            const evaluationReport = response.report[0].result;
            storeReport(evaluationReport);
        });

    }else{
        alert("You need to choose at least one analizer");
    }

}









function merge(jsonLd1, jsonLd2){

	if(jsonLd2["dct:date"] > jsonLd1["dct:date"]) jsonLd1["dct:date"] = jsonLd2["dct:date"]

	jsonLd1.assertors.push(jsonLd2.assertors[0]);

	jsonLd1.creator["xmlns:name"] += " & " + jsonLd2.creator["xmlns:name"];

	for (var i = 0, assertion1, assertion2; assertion1 = jsonLd1.auditSample[i], assertion2 = jsonLd2.auditSample[i]; i++){
		
		if(assertion2.result.outcome === "earl:untested"){ 

			continue; 

		} else if(/^(earl:untested|earl:inapplicable)$/.test(assertion1.result.outcome)){

			assertion1 = assertion2;

		} else if(assertion2.result.outcome === "earl:inapplicable"){

            continue;

        }else {

			mergeFoundCases(assertion1, assertion2);

			if((assertion1.result.outcome === "earl:passed" && assertion2.result.outcome !== "earl:passed") 
			|| (assertion1.result.outcome === "earl:cantTell" && assertion2.result.outcome === "earl:failed")){

				assertion1.result = assertion2.result;
	
			}

		}

	}

}


function mergeFoundCases(assertion1, assertion2){
		
	assertion2.hasPart.forEach(case2 => {
	
		var case_index = assertion1.hasPart.findIndex((case1) => {
			return case1.result.outcome === case2.result.outcome;
		});

		if(case_index === -1){
			assertion1.hasPart.push(case2);
			return;
		}

		case2.assertedBy.forEach((assertor)=>{
			assertion1.hasPart[case_index].assertedBy.push(assertor);
		});

		assertion1.hasPart[case_index].result.description += "\n\n" + case2.result.description;

		case2.result.locationPointersGroup.forEach((pointer2) => {
			
			var exists_index = assertion1.hasPart[case_index].result.locationPointersGroup.findIndex((pointer1) => {
				return pointer1.description === pointer2.description;
			});

			if(exists_index === -1){
				assertion1.hasPart[case_index].result.locationPointersGroup.push(pointer2);					
			}else if(pointer2["ptr:expression"].startsWith("//html/body")){
				assertion1.hasPart[case_index].result.locationPointersGroup[exists_index]["ptr:expression"] = pointer2["ptr:expression"];
			}
			
		});

	});

}