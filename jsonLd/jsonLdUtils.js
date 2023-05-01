

/**
 * Merges two JSON-LD objects representing accessibility evaluation reports.
 * @function mergeJsonLds
 * @param {Object} jsonLd1 - The first JSON-LD object to merge.
 * @param {Object} jsonLd2 - The second JSON-LD object to merge.
 * @returns {void}
 * @throws {Error} If there was an error merging the reports.
 */
function mergeJsonLds(jsonLd1, jsonLd2){

    try{

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

                mergeFoundCases(jsonLd1.auditSample[i].hasPart, assertion2.hasPart);

            }
        }

    } catch(error) {
        throw new Error("Error merging JsonLd reports => " + error.message);
    }
	
}




/**
 * Merges the "hasPart" array of two EARL reports, updating the first report with any new or modified assertions from the second report.
 * @function mergeFoundCases
 * @param {Array} hasPart1 - The "hasPart" array of the first EARL report.
 * @param {Array} hasPart2 - The "hasPart" array of the second EARL report.
 * @returns {undefined}
 */
function mergeFoundCases(hasPart1, hasPart2){

    for(const foundCase2 of hasPart2){

        const foundCase1 = hasPart1.find(foundCase => foundCase.result.outcome === foundCase2.result.outcome);
        
        if(foundCase1){

            for(const assertor of foundCase2.assertedBy){
                foundCase1.assertedBy.push(assertor);
            }
            
            foundCase1.result.description += "\n\n" + foundCase2.result.description;
            
            for(const pointer2 of foundCase2.result.locationPointersGroup){

                const pointer1 = foundCase1.result.locationPointersGroup.find(pointer1 => pointer1.description === pointer2.description);

                if(pointer1){
                    for(const assertor of pointer2.assertedBy){
                        pointer1.assertedBy.push(assertor);
                    }
                }else{
                    foundCase1.result.locationPointersGroup.push(pointer2);
                }
                
            }

        }else{
            hasPart1.push(foundCase2);
        }
    }
}

module.exports = mergeJsonLds;