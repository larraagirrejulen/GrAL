

/** 
 * Function to store given json on extension localStorage
 */
function saveJson(json){
    localStorage.setItem("json",json);
    update();
    window.location.reload();
}



/**
 * Merge the two JSON passed by parameters to get a single JSON
 * 
 * The result is stored in the first parameter
 * 
 * */
function merge(json,json1){

    if(json == null){
        json = json1;
        return;
    } else if (json1 == null){
        return;
    }

    var tipo_1 = json.defineScope.conformanceTarget;
    var tipo_2 = json1.defineScope.conformanceTarget;

    if(tipo_1 !=="AA" || tipo_2 !== "AA"){
        alert("Aggregation not possible, both files must have a conformance target of AA.");
        return;
    }
    if(json.defineScope.scope.title !== json1.defineScope.scope.title){
        alert("Aggregation not possible, the website names of the files doesn't match.");
        return; 
    }

    merge_reportFindings(json,json1);
    merge_audit_samples(json,json1);
}

/**
 * Merges the results of the second JSON given by parameter with the first one
 * */
function merge_reportFindings(json, json1){
    //Date
    let fecha = Date.parse(json.reportFindings.date["@value"]);
    let fecha1 = Date.parse(json1.reportFindings.date["@value"]);
    
    //The most recent date is written
    if(fecha < fecha1){
        json.reportFindings.date["@value"] = json1.reportFindings.date["@value"];
    }

    //Evaluator: The creator, if it is empty, set the creator of the imported document, otherwise leave the original.
    if(json.reportFindings.evaluator == ""){
        json.reportFindings.evaluator = json1.reportFindings.evaluator;
    }

    //Commissioner: Who has done it, they are added
    let commissioner = json.reportFindings.commissioner;
    let commissioner1 =  json1.reportFindings.commissioner;
    if(commissioner !== ""){
        json.reportFindings.commissioner= commissioner+" & "+commissioner1;
    }else if(commissioner1 !== ""){
        json.reportFindings.commissioner= commissioner1;
    }


    //Summary
    let summary = json.reportFindings.summary;
    let summary1 = json1.reportFindings.summary;
    console.log("1: "+summary+" 2: "+summary1);

    if(summary == ""){
        json.reportFindings.summary= summary1;
    }else if(summary1 !== ""){
        json.reportFindings.summary= summary+" & "+summary1;
    }


    //Evaluation specifics
    /*
    WCAG-EM suggests that you archive the web pages audited. For more information, see WCAG-EM Step 5.b: Record the Evaluation
     Specifics. You can use this text field to record the evaluation tools, web browsers, assistive technologies, 
     other software, and methods used for the evaluation. What you enter here will be included in the generated report. 
     After you download the report, you could delete or edit this information in the HTML file before submitting the report.
    */
    let evaluationSpecifics = json.reportFindings.evaluationSpecifics;
    let evaluationSpecifics1 =  json1.reportFindings.evaluationSpecifics;
    if(evaluationSpecifics !== ""){
        json.reportFindings.evaluationSpecifics= evaluationSpecifics+" & "+evaluationSpecifics1;
    }else if(evaluationSpecifics1 !== ""){
        json.reportFindings.evaluationSpecifics= evaluationSpecifics1;
    }

    return json;
}

/**
 * Merges the tests of the two JSON passed by parameter and saves them in "primario".
 * 
 * The length of both JSON must be the same, because they will both be conformance target: 'AA'.
 * */
function merge_audit_samples(primario,secundario){
    var arr_sec = secundario.auditSample;
    let longitud = primario.auditSample.length;

    let texto = "";
    var obj_prim;

    var res_prov1;
    var res_prov2;        
    var au1 = {};
    var au2 = {};
    var codigos1;
    var codigos2;

    var com1 = primario.reportFindings.evaluator;
    var com2 = secundario.reportFindings.evaluator;

    var au1_des = "";
    var au2_des = "";


    for (var i = 0; i <longitud; i++){
        texto = "";
        obj_prim = primario.auditSample[i];
        //console.log(obj_prim.test.id);

        /*
        --------------------Criteria---------------------
        -If one of the two is "failed", result is "failed".
        -If one is "untested" and the other is tested, the result of the other is set.
        -If one is "cantTell" and the other has a result, the result of the other is set.
        */

        //We check if it happens in the original.
        res_prov1 = primario.auditSample[i].result.outcome.id;
        res_prov2 = secundario.auditSample[i].result.outcome.id;

        au1 = primario.auditSample[i];
        au2 = secundario.auditSample[i];

        au1_des = primario.auditSample[i].result.description;
        au2_des = secundario.auditSample[i].result.description;

        codigos1 = primario.auditSample[i].result.codigo_error;
        codigos2 = secundario.auditSample[i].result.codigo_error;


        switch(true){

            //Case the first one untested and the second one not untested
            case(res_prov1 == "earl:untested" && res_prov2 !== "earl:untested"):

                primario.auditSample[i].result = au2.result;
                break;

            //Case both fail: Descriptions are added together
            case(res_prov1 == "earl:failed" && res_prov2 == "earl:failed"):
                break;
            //Case the second is failed, it doesn't matter what is first.
            case(res_prov2 == "earl:failed"):
                primario.auditSample[i].result= au2.result;
                break;

            //Case the first is cantTell and the second is different from cantTell
            case(res_prov1 == "earl:cantTell" && res_prov2 !== "earl:cantTell"):
                primario.auditSample[i].result = au1.result;
                break;
            default:
                break;
        }
        if(!au1_des.startsWith('<b>@') && au1_des !== ''){
            primario.auditSample[i].result.description="<b>@"+com1+'</b>['+res_prov1.substring(5)+']: '+au1_des;
        }else{
            primario.auditSample[i].result.description=au1_des;
        }
        if(au2_des !== ''){
            if(primario.auditSample[i].result.description !== ''){
                primario.auditSample[i].result.description+="<br><br>";
            }
            primario.auditSample[i].result.description+="<b>@"+com2+'</b>['+res_prov2.substring(5)+']: '+au2_des;
        }


        //We add codes which the user will be able to click on to find them
        if(codigos1 !== undefined && codigos2 !== undefined){
            //Setting the codes
            switch(true){
                //Case one empty and the other full
                case (codigos1.length === 0 && codigos2.length !==0):
                    primario.auditSample[i].result.codigo_error = codigos2;
                    break;
                //Case one empty and the other full
                case (codigos1.length !== 0 && codigos2.length ===0):
                    primario.auditSample[i].result.codigo_error = codigos1;
                    break;
                //Case both full, concatenate the arrays
                case (codigos1.length !== 0 && codigos2.length !==0):
                    let array_merged = codigos1.concat(codigos2);
                    primario.auditSample[i].result.codigo_error = array_merged;
                    break;
                //Remaining case: Both emtpy
                default:
                    primario.auditSample[i].result.codigo_error = [];
            }
        //If it reaches the "else", it means that one of the two has no code. The code of the one that has the code is put in.
        }else{
            if(codigos1 !== undefined){
                primario.auditSample[i].result.codigo_error = codigos1;
            }
            if(codigos2 !== undefined){
                primario.auditSample[i].result.codigo_error = codigos2;     
            }
        }
    }
}
