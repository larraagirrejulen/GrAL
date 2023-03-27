
import { getSuccessCriterias, getWcagStructure } from './wcagUtils.js'
import { getStoredReport }  from './reportStoringUtils.js';


/** 
 * Update is used to analyse the newly added data, whether obtained automatically or manually,
 * by adding a report.
 * 
 * With that data, it creates the results table.
 */
export function load_result_table(){

    var stored_report = getStoredReport();

    var [passed, failed, cannot_tell, not_present, not_checked] = initialiceOutcomeVariables();

    var criterias = getSuccessCriterias();
    var results = stored_report["auditSample"]
    var obj, level;
    var json_resultados = {};
    for (var i = 0; i <results.length; i++){
        level = criterias[i].conformanceLevel;
        obj = results[i];
        switch(obj.result.outcome) {
            case "earl:failed":
                failed[level] = failed[level]+1;
                break;
            case "earl:untested":
                not_checked[level] = not_checked[level]+1;
                break;
            case "earl:cantTell":
                cannot_tell[level] = cannot_tell[level]+1;
                break;
            case "earl:passed":
                passed[level] = passed[level]+1;
                break;
            case "earl:inapplicable":
                not_present[level] = not_present[level]+1;
                break;
            default:
        }

        json_resultados[criterias[i].num] = {
            'result' : obj.result.outcome,
            "Codigos": obj.hasPart,
            'mensaje': obj.result.description,
            "conformanceLevel": level
        };
    }

    localStorage.setItem('json_resultados',JSON.stringify(json_resultados));

    var results_summary = {
        "passed": passed,
        "failed": failed,
        "cannot_tell": cannot_tell,
        "not_present": not_present,
        "not_checked": not_checked
    }

    localStorage.setItem("tabla_resultados",JSON.stringify(results_summary));

    var category_results = [];
    var categoryData, subsesction_results;
    var mainCategories = getWcagStructure('0');

    for(var categoryKey in mainCategories){
        
        categoryData = get_data_by_category(categoryKey);
        subsesction_results = load_subsections(categoryKey);

        category_results.push({
            "category": mainCategories[categoryKey],
            "passed": categoryData[0],
            "failed": categoryData[1],
            "cannot_tell": categoryData[2],
            "not_present": categoryData[3],
            "not_checked": categoryData[4],
            "subsection": subsesction_results
        });

        
    }

    localStorage.setItem("tabla_main",JSON.stringify(category_results));
}


/**
 * Prints out the subsections of the "s" section in HTML and returns it
 */
function load_subsections(categoryKey){

    var subCategories = getWcagStructure(categoryKey);
    var subsection_results = [];
    var subCategoryData, sub2section_results;

    for(var subCategoryKey in subCategories){

        subCategoryData = get_data_by_category(subCategoryKey);

        if (Object.keys(getWcagStructure(subCategoryKey)).length > 0){
            sub2section_results = load_sub2sections(subCategoryKey);
        }

        subsection_results.push({
            "subsection": subCategories[subCategoryKey],
            "passed": subCategoryData[0],
            "failed": subCategoryData[1],
            "cannot_tell": subCategoryData[2],
            "not_present": subCategoryData[3],
            "not_checked": subCategoryData[4],
            "sub2section": sub2section_results
        });

    }
    return subsection_results;
}

/**
 * Prints the subsubsections of the subsection passed as parameter and returns it as HTML string
 */
function load_sub2sections(subCategoryKey){

    const json_resultados = JSON.parse(localStorage.getItem('json_resultados'));

    var sub2section_results = [];
    var sub2Categories = getWcagStructure(subCategoryKey);
    var length, result, criteria, background_color, result_text, results;

    for(var sub2CategoryKey in sub2Categories){
        length = 0;
        if(sub2CategoryKey in json_resultados){
            result = json_resultados[sub2CategoryKey]; 
            switch(result.result) {
                case "earl:failed":
                    background_color = "#FA8C8C";
                    result_text = "FAILED";
                    break;
                case "earl:untested":
                    background_color = "#8CFAFA";
                    result_text = "NOT CHECKED";
                    break;
                case "earl:cantTell":
                    background_color = "#F5FA8C";
                    result_text = "CAN'T TELL";
                    break;
                case "earl:passed":
                    background_color = "#C8FA8C";
                    result_text = "PASSED";
                    break;
                case "earl:inapplicable":
                    background_color = "#000000";
                    result_text = "NOT PRESENT";                
                    break;
                default:
                    background_color = "";
                    result_text = "";
            }
            
            if("Codigos" in result){
                length = json_resultados[sub2CategoryKey]['Codigos'].length;
            }
            
        }else{
            console.log('No en el documento: '+sub2CategoryKey);
            background_color = "#8CFAFA";
            result_text = "NOT CHECKED";
        }
        
        criteria = sub2Categories[sub2CategoryKey];

        results = {
            "sub2section": sub2Categories[sub2CategoryKey],
            "background_color": background_color,
            "criteria": criteria,
            "result_text": result_text,
            "conformanceLevel": json_resultados[sub2CategoryKey].conformanceLevel
        }

        //Text could be painted bacause it was made auot or manual.
        //Manual has len = 0, we need to check if 
        //First we get the WCAG name
        var mensaje_wcag_manual = '';
        if(length === 0){
            mensaje_wcag_manual = json_resultados[sub2CategoryKey].mensaje; 
            if(mensaje_wcag_manual!== ''){
                results["manual_message"] = mensaje_wcag_manual;
            }
        }else{
            results["results"] = load_final_results(sub2CategoryKey);
        }

        sub2section_results.push(results);

    }
    return sub2section_results;
}

/** 
 * Given a sub-subsection as a parameter, prints the results obtained in the analysis 
 * and returns it as an HTML string
 */
function load_final_results(sub2CategoryKey){

    const json_resultados = JSON.parse(localStorage.getItem('json_resultados'));
    const assertions = json_resultados[sub2CategoryKey]['Codigos'];

    var locations, outcome, description, locations_length, assertor, pointed_html, xpath, results;

    var final_results = [];

    for (var i = 0; i < assertions.length; i++) {
        locations = assertions[i].result.locationPointersGroup;
        outcome = assertions[i].result.outcome.replace("earl:", "");
        description = assertions[i].result.description;
        assertor = assertions[i].assertedBy;

        description = description.replaceAll('<','&lt;');
        description = description.replaceAll('>','&gt;');
        description = description.replaceAll('&lt;','<code>&lt;');
        description = description.replaceAll('&gt;','&gt;</code>');
        
        

        results = {
            "assertor": assertor,
            "outcome": outcome,
            "description": description
        }

        if("solucion" in assertions[i]){
            results["solution"] = assertions[i]['solucion'];
        }

        locations_length = locations.length;

        if(locations_length>0){

            results["pointers"] = []

            for (var j = 0; j < locations_length; j++) {
                pointed_html = locations[j]['description'].replaceAll('<','&lt;');
                pointed_html = pointed_html.replaceAll('>','&gt;');

                xpath = locations[j]['ptr:expression']; 

                results["pointers"].push({
                    "pointed_html": pointed_html,
                    "pointed_xpath": xpath
                })
            }
        }

        final_results.push(results);
    }

    return final_results;
}



/** 
 * Given a sub-substandard as a parameter, obtains the results in terms of failures, passes, warnings,
 * not present and not checked for that sub-substandard and returns it as an array, 
 */
function get_data_by_category(categoryKey){
    var json_resultados = localStorage.getItem('json_resultados');
    json_resultados = JSON.parse(json_resultados);
    
    var [passed, failed, cannot_tell, not_present, not_checked] = initialiceOutcomeVariables();

    var result, level;
    for (var criteriaNumber in json_resultados) {
        if (criteriaNumber.startsWith(categoryKey)){
            result = json_resultados[criteriaNumber].result; 
            level = json_resultados[criteriaNumber].conformanceLevel;
            switch(result) {
                case "earl:failed":
                    failed[level] = failed[level]+1;
                    break;
                case "earl:untested":
                    not_checked[level] = not_checked[level]+1;
                    break;
                case "earl:cantTell":
                    cannot_tell[level] = cannot_tell[level]+1;
                    break;
                case "earl:passed":
                    passed[level] = passed[level]+1;
                    break;
                case "earl:inapplicable":
                    not_present[level] = not_present[level]+1;
                    break;
                default:
            }
        }
    }
    return [passed, failed, cannot_tell, not_present, not_checked];
}


function initialiceOutcomeVariables(){
    var initialValues = ["A", "AA", "AAA"].reduce((obj, item) => {
        obj[item] = 0;
        return obj;
    }, {});
    
    var passed = Object.assign({}, initialValues);
    var failed = Object.assign({}, initialValues);
    var cannot_tell = Object.assign({}, initialValues);
    var not_present = Object.assign({}, initialValues);
    var not_checked = Object.assign({}, initialValues);

    return [passed, failed, cannot_tell, not_present, not_checked];
}






