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

    const checkboxes = JSON.parse(localStorage.getItem("checkboxes"));

    const AM = checkboxes[0].checked;
    const AC = checkboxes[1].checked;
    const MV = checkboxes[2].checked;
    const A11Y = checkboxes[3].checked;
    const PA = checkboxes[4].checked;
        
    if(AM || AC || MV || PA){

        const bodyData = JSON.stringify({ "am": AM, "ac": AC, "mv":MV, "pa":PA, "url": window.location.href, "title": window.document.title});
        let fetchEvaluationReport = await fetchEvaluation(bodyData);

        if (A11Y){
            chrome.runtime.sendMessage({ action: "performA11yEvaluation"}, (response)=>{
                const localEvaluationReport = response.report[0].result;
                merge(fetchEvaluationReport, localEvaluationReport);
                storeReport(fetchEvaluationReport);
            });
        }else{
            storeReport(fetchEvaluationReport);
        }
        

    }else if(A11Y){

        chrome.runtime.sendMessage({ action: "performA11yEvaluation"}, (response)=>{
            const evaluationReport = response.report[0].result;
            storeReport(evaluationReport);
        });

    }else{
        alert("You need to choose at least one analizer");
    }

}




function merge(jsonLd1, jsonLd2){

	if(jsonLd2["dct:date"] > jsonLd1["dct:date"]) jsonLd1["dct:date"] = jsonLd2["dct:date"];

	jsonLd1.assertors.push(...jsonLd2.assertors);

	jsonLd1.creator["xmlns:name"] += " & " + jsonLd2.creator["xmlns:name"];

	for (let i = 0; i < jsonLd1.auditSample.length; i++) {

        let assertion1 = jsonLd1.auditSample[i];
        let assertion2 = jsonLd2.auditSample[i];
		
		if(assertion2.result.outcome === "earl:untested"){ 
			continue; 

		} else if(assertion1.result.outcome === "earl:untested"){

            jsonLd1.auditSample[i] = assertion2;

        } else {

			if((assertion1.result.outcome === "earl:inapplicable" && assertion2.result.outcome !== "earl:inapplicable") 
			|| (assertion1.result.outcome === "earl:passed" && (assertion2.result.outcome === "earl:cantTell" || assertion2.result.outcome === "earl:failed"))
            || (assertion1.result.outcome === "earl:cantTell" && assertion2.result.outcome === "earl:failed")){

				jsonLd1.auditSample[i].result = assertion2.result;
	
			}

            mergeHasParts(jsonLd1.auditSample[i].hasPart, assertion2.hasPart);
            //jsonLd1.auditSample[i].hasPart.push(...assertion2.hasPart);

		}

	}

}

function mergeHasParts(hasPart1, hasPart2){

    for(const foundCase2 of hasPart2){
        const foundCase1 = hasPart1.find(foundCase => foundCase.result.outcome === foundCase2.result.outcome);
        if(foundCase1){
            for(const assertor of foundCase2.assertedBy){
                foundCase1.assertedBy.push(assertor);
            }
            
            for(const description of foundCase2.result.descriptions){
                foundCase1.result.descriptions.push(description);
                foundCase1.result.description += description;
            }
            

            for(const pointer of foundCase2.result.locationPointersGroup){

                //FALTA CHECKEAR SI HTML SUJETO YA EXISTE
                foundCase1.result.locationPointersGroup.push(pointer);
            }
           

        }else{
            hasPart1.push(foundCase2);
        }
    }

}