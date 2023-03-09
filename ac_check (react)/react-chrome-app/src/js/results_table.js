/** 
 * Update is used to analyse the newly added data, whether obtained automatically or manually,
 * by adding a report.
 * 
 * With that data, it creates the results table.
 */
export default function load_result_table(){
    var report = localStorage.getItem("json");
    var json = JSON.parse(report);

    var passed = 0;
    var failed = 0;
    var cannot_tell = 0;
    var not_present = 0;
    var not_checked = 0;

    var criterias = getSuccessCriterias();
    var results = json[0]["auditSample"]
    var obj;
    var json_resultados = {};
    console.log( results);
    for (var i = 0; i <results.length; i++){
        obj = results[i];
        switch(obj.result.outcome) {
            case "earl:failed":
                failed = failed+1;
                break;
            case "earl:untested":
                not_checked = not_checked+1;
                break;
            case "earl:cantTell":
                cannot_tell = cannot_tell+1;
                break;
            case "earl:passed":
                passed = passed+1;
                break;
            case "earl:inapplicable":
                not_present = not_present+1;
                break;
            default:
        }

        json_resultados[criterias[i].num] = {
            'result' : obj.result.outcome,
            "Codigos": obj.result.hasPart,
            'mensaje': obj.result.description
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

    var tabla_contenido= "<table class='tabla_contenido' style='width:100%; font-size:10px'>";
    tabla_contenido += "<tr><th style='width:68% !important;font-size:12px !important;background-color:white !important'>Standard</th><th style='background-color:#C8FA8C' title='Passed'>P</th>";
    tabla_contenido += "<th style='background-color:#FA8C8C' title='Failed'>F</th><th style='background-color:#F5FA8C' title='Can&#39;t tell'>CT</th>";
    tabla_contenido += "<th title='Not Present' style='background-color:#FFFFFF !important;'>NP</th><th style='background-color:#8CFAFA' title='Not checked'>NC</th></tr></table>";

    var categoryData;
    var mainCategories = get_table_structure('0');
    for(var categoryKey in mainCategories){
        categoryData = get_data_by_category(categoryKey);
        tabla_contenido +='<button type="button" class="collapsible_tabla"><table style="width:100%; table-layout: fixed; overflow-wrap: break-word;""><tr><td style="width:70%">';
        tabla_contenido += mainCategories[categoryKey];
        tabla_contenido += '</td><td>'+categoryData[0]+'</td><td>'+categoryData[1]+'</td><td>'+categoryData[2]+'</td><td>'+categoryData[3]+'</td><td>'+categoryData[4]+'</td>';
        tabla_contenido += '</tr></table></button><div class="content_tabla">';
        tabla_contenido += load_subsections(categoryKey);
        tabla_contenido += '</div>';
    }

    
    localStorage.setItem("tabla_main",tabla_contenido);
}


/**
 * Prints out the subsections of the "s" section in HTML and returns it
 */
function load_subsections(categoryKey){
    var subCategories = get_table_structure(categoryKey);
    let sub2Categories;
    var codigo_nav_st = "";
    var subCategoryData
    for(var subCategoryKey in subCategories){
        subCategoryData = get_data_by_category(subCategoryKey);
        codigo_nav_st +='<button type="button" class="collapsible_tabla2"><table style="width:100%; table-layout: fixed; overflow-wrap: break-word;""><tr><td style="font-size:10px;width:70%; white-space:normal;text-align: left;">';
        codigo_nav_st += subCategories[subCategoryKey];
        codigo_nav_st += '</td><td style="font-size:10px;">'+subCategoryData[0]+'</td><td style="font-size:10px;">'+subCategoryData[1]+'</td><td style="font-size:10px;">'+subCategoryData[2]+'</td><td style="font-size:10px;">'+subCategoryData[3]+'</td><td style="font-size:10px;">'+subCategoryData[4]+'</td>';
        codigo_nav_st += '</tr></table></button><div class="content_tabla">';
        sub2Categories = get_table_structure(subCategoryKey);
        if (Object.keys(sub2Categories).length >0){
            codigo_nav_st += load_sub2sections(subCategoryKey);
        }
        codigo_nav_st+='</div>';
    }
    return codigo_nav_st;
}

/**
 * Prints the subsubsections of the subsection passed as parameter and returns it as HTML string
 */
function load_sub2sections(subCategoryKey){
    var sub2Categories = get_table_structure(subCategoryKey);
    var codigo_nav_st = "";
    var length, result, criteria, manual, style, result_text;
    const json_resultados = JSON.parse(localStorage.getItem('json_resultados'));

    for(var sub2CategoryKey in sub2Categories){
        length = 0;
        manual = false;
        if(sub2CategoryKey in json_resultados){
            result = json_resultados[sub2CategoryKey]; 
            switch(result.result) {
                case "earl:failed":
                    style = "background-color:#FA8C8C";
                    result_text = "FAILED";
                    break;
                case "earl:untested":
                    style = "background-color:#8CFAFA";
                    result_text = "NOT CHECKED";
                    break;
                case "earl:cantTell":
                    style = "background-color:#F5FA8C";
                    result_text = "CAN'T TELL";
                    break;
                case "earl:passed":
                    style = "background-color:#C8FA8C";
                    result_text = "PASSED";
                    break;
                case "earl:inapplicable":
                    style = "background-color:#000000";
                    result_text = "NOT PRESENT";                
                    break;
                default:
                    style = "";
                    result_text = "";
            }
            
            if("Codigos" in result){
                length = json_resultados[sub2CategoryKey]['Codigos'].length;
            }
            
        }else{
            console.log('No en el documento: '+sub2CategoryKey);
            style = "background-color:#8CFAFA";
            result_text = "NOT CHECKED";
        }
        
        //Text could be painted bacause it was made auot or manual.
        //Manual has len = 0, we need to check if 
        //First we get the WCAG name
        var mensaje_wcag_manual = '';
        if(length === 0){
            mensaje_wcag_manual = json_resultados[sub2CategoryKey].mensaje; 
            if(mensaje_wcag_manual!== ''){
                manual = true;
            }
        }

        criteria = sub2Categories[sub2CategoryKey];
        codigo_nav_st +='<button type="button" class="collapsible_tabla3" style="'+style+'"><table style="width:100%; table-layout: fixed; overflow-wrap: break-word;""><tr>';

        if(length>0 || manual){
            codigo_nav_st += '<td style="width:15%;"><img src="" alt="Show information" height="20px"></td>';
            codigo_nav_st += '<td style="width:55%;  font-size:10px;  text-align: left;">'+criteria+'</td>';
        }else{
            codigo_nav_st += '<td style="width:70%;  font-size:10px;  text-align: left;">'+criteria+'</td>';
        }
        codigo_nav_st += '<td style="font-size:9px"><b>'+result_text+'</b></td>';
        codigo_nav_st += '</tr></table></button><div class="content_tabla">';
        
        if(length>0){
            codigo_nav_st += load_final_results(sub2CategoryKey);
        }else if(manual){
            codigo_nav_st += '<table class="tabla_resultados">';
            codigo_nav_st += '<tr><td><b><u>Manual message</u></b>: <br>'+mensaje_wcag_manual;
            codigo_nav_st += '</td></tr></table>';

        }
        
        codigo_nav_st+='</div>';
    }
    return codigo_nav_st;
}

/** 
 * Given a sub-subsection as a parameter, prints the results obtained in the analysis 
 * and returns it as an HTML string
 */
function load_final_results(sub2CategoryKey){

    const json_resultados = JSON.parse(localStorage.getItem('json_resultados'));
    const assertions = json_resultados[sub2CategoryKey]['Codigos'];

    var html = '<table class="tabla_resultados">';

    var locations, outcome, description, locations_length, assertor, pointed_html, pointer_xpath;

    for (var i = 0; i < assertions.length; i++) {
        locations = assertions[i].result.locationPointersGroup;
        outcome = assertions[i].result.outcome.replace("earl:", "");
        description = assertions[i].result.description;
        assertor = assertions[i].assertedBy;

        description = description.replaceAll('<','&lt;');
        description = description.replaceAll('>','&gt;');
        description = description.replaceAll('&lt;','<code>&lt;');
        description = description.replaceAll('&gt;','&gt;</code>');

        html += '<tr><td><u>Assertor</u>:  <b>'+assertor+'</b></td></tr>';
        html += '<tr><td><u>Result</u>:  <b>'+outcome+'</b></td></tr>';
        html += '<tr><td><u>Message:</u></td></tr>';
        html += '<tr><td>'+description+'</td></tr>';
        if("solucion" in assertions[i]){
            html += '<tr><td><u>Posible solution</u>:</td></tr>';
            html += '<tr><td>'+assertions[i]['solucion']+'</td></tr>';
        }
        locations_length = locations.length;
        if(locations_length>0){
            html += '<tr><td><u>Code</u>:</td></tr>';
            html += '<tr><td>';
            for (var j = 0; j < locations_length; j++) {
                pointed_html = locations[j]['description'].replaceAll('<','&lt;');
                pointed_html = pointed_html.replaceAll('>','&gt;');

                pointer_xpath = ""; 
                if('location' in locations[j]){
                    pointer_xpath = 'alt="'+locations[j]['ptr:expression']+'"';
                }

                html += '<code class="codigo_analisis" style="cursor: pointer;"'+pointer_xpath+'>'+pointed_html+'</code>';
            }
            html += '<br><br></td></tr>';
        }else{
            html = html.substring(0,html.length-10)+'<br><br></td></tr>';
        }
    }
    html += '</table>'; 

    return html;
}



/** 
 * Given a sub-substandard as a parameter, obtains the results in terms of failures, passes, warnings,
 * not present and not checked for that sub-substandard and returns it as an array, 
 */
function get_data_by_category(categoryKey){
    var json_resultados = localStorage.getItem('json_resultados');
    json_resultados = JSON.parse(json_resultados);

    var passed = 0;
    var failed = 0;
    var cannot_tell = 0;
    var not_present = 0;
    var not_checked = 0;
    var result;

    for (var criteriaNumber in json_resultados) {
        if (criteriaNumber.startsWith(categoryKey)){
            result = json_resultados[criteriaNumber].result; 
            switch(result) {
                case "earl:failed":
                    failed = failed+1;
                    break;
                case "earl:untested":
                    not_checked = not_checked+1;
                    break;
                case "earl:cantTell":
                    cannot_tell = cannot_tell+1;
                    break;
                case "earl:passed":
                    passed = passed+1;
                    break;
                case "earl:inapplicable":
                    not_present = not_present+1;
                    break;
                default:
            }
        }
    }
    return [passed, failed, cannot_tell, not_present, not_checked];
}



/**
 * Given a standard or sub-standard, returns the subsections of that standard or sub-standard.
 */
function get_table_structure(category){
    var structure = {};
    switch(category){
        case '0':
            structure ={
                '1': '1 Perceivable',
                '2': '2 Operable',
                '3': '3 Understandable',
                '4': '4 Robust'
            };
            break;
        case '1':
            structure = {
                '1.1': '1.1 Text Alternatives',
                '1.2': '1.2 Time-based Media',
                '1.3': '1.3 Adaptable',
                '1.4': '1.4 Distinguishable'
            };
            break;
        case '2':
            structure = {
                '2.1': '2.1 Keyboard Accessible',
                '2.2': '2.2 Enough Time',
                '2.3': '2.3 Seizures and Physical Reactions',
                '2.4': '2.4 Navigable',
                '2.5': '2.5 Input Modalities'
            }
            break;
        case '3':
            structure = {
                '3.1': '3.1 Readable',
                '3.2': '3.2 Predictable',
                '3.3': '3.3 Input Assistance',
            }
            break;
        case '4':
            structure = {
                '4.1' : '4.1 Compatible'
            }
            break;

        case '1.1':
            structure = {
                '1.1.1' : '1.1.1: Non-text Content',
            }
            break;
        case '1.2':
            structure = {
                '1.2.1':'1.2.1: Audio-only and Video-only (Prerecorded)',
                '1.2.2':'1.2.2: Captions (Prerecorded)',
                '1.2.3':'1.2.3: Audio Description or Media Alternative (Prerecorded)',
                '1.2.4':'1.2.4: Captions (Live)',
                '1.2.5':'1.2.5: Audio Description (Prerecorded)',
                '1.2.6':'1.2.6: Sign Language (Prerecorded)',
                '1.2.7':'1.2.7: Extended Audio Description (Prerecorded)',
                '1.2.8':'1.2.8: Media Alternative (Prerecorded)',
                '1.2.9':'1.2.9: Audio-only (Live)',
            }
            break;
        case '1.3':
            structure = {
                '1.3.1':'1.3.1: Info and Relationships',
                '1.3.2':'1.3.2: Meaningful Sequence',
                '1.3.3':'1.3.3: Sensory Characteristics',
                '1.3.4':'1.3.4: Orientation',
                '1.3.5':'1.3.5: Identify Input Purpose',
                '1.3.6':'1.3.6: Identify Purpose',
            }
            break;
        case '1.4':
            structure = {
                '1.4.1':'1.4.1: Use of Color',
                '1.4.2':'1.4.2: Audio Control',
                '1.4.3':'1.4.3: Contrast (Minimum)',
                '1.4.4':'1.4.4: Resize tex',
                '1.4.5':'1.4.5: Images of Text',

                '1.4.6':'1.4.6: Contrast (Enhanced)',
                '1.4.7':'1.4.7: Low or No Background Audio',
                '1.4.8':'1.4.8: Visual Presentation',
                '1.4.9':'1.4.9: Images of Text (No Exception)',

                '1.4.10':'1.4.10: Reflow',
                '1.4.11':'1.4.11: Non-text Contrast',
                '1.4.12':'1.4.12: Text Spacing',
                '1.4.13':'1.4.13: Content on Hover or Focus',

            }
            break;
        case '2.1':
            structure = {
                '2.1.1':'2.1.1: Keyboard',
                '2.1.2':'2.1.2: No Keyboard Trap',
                '2.1.3':'2.1.3: Keyboard (No Exception)',
                '2.1.4':'2.1.4: Character Key Shortcuts',
            }
            break;
        case '2.2':
            structure = {
                '2.2.1':'2.2.1: Timing Adjustable',
                '2.2.2':'2.2.2: Pause, Stop, Hide',
                '2.2.3':'2.2.3: No Timing',
                '2.2.4':'2.2.4: Interruptions',
                '2.2.5':'2.2.5: Re-authenticating',
                '2.2.6':'2.2.6: Timeouts',
            }
            break;
        case '2.3':
            structure = {
                '2.3.1':'2.3.1: Three Flashes or Below Threshold',
                '2.3.2':'2.3.2: Three Flashes',
                '2.3.3':'2.3.3: Animation from Interactions'
            }
            break;
        case '2.4':
            structure = {
                '2.4.1':'2.4.1: Bypass Blocks',
                '2.4.2':'2.4.2: Page Titled ',
                '2.4.3':'2.4.3: Focus Order',
                '2.4.4':'2.4.4: Link Purpose (In Context)',
                '2.4.5':'2.4.5: Multiple Ways',
                '2.4.6':'2.4.6: Headings and Labels',
                '2.4.7':'2.4.7: Focus Visible',
                '2.4.8':'2.4.8: Location',
                '2.4.9':'2.4.9: Link Purpose (Link Only)',
                '2.4.10':'2.4.10: Section Headings'
            }
            break;
        case '2.5':
            structure = {
                '2.5.1':'2.5.1: Pointer Gestures',
                '2.5.2':'2.5.2: Pointer Cancellation',
                '2.5.3':'2.5.3: Label in Name',
                '2.5.4':'2.5.4: Motion Actuation',
                '2.5.5':'2.5.5: Target Size',
                '2.5.6':'2.5.6: Concurrent Input Mechanisms'
            }
            break;
        case '3.1':
            structure = {
                '3.1.1':'3.1.1: Language of Page',
                '3.1.2':'3.1.2: Language of Parts',
                '3.1.3':'3.1.3: Unusual Words',
                '3.1.4':'3.1.4: Abbreviations',
                '3.1.5':'3.1.5: Reading Level',
                '3.1.6':'3.1.6: Pronunciation',
            }
            break;
        case '3.2':
            structure = {
                '3.2.1':'3.2.1: On Focus',
                '3.2.2':'3.2.2: On Input',
                '3.2.3':'3.2.3: Consistent Navigation',
                '3.2.4':'3.2.4: Consistent Identification',
                '3.2.5':'3.2.5: Change on Request'
            }
            break;
        case '3.3':
            structure = {
                '3.3.1':'3.3.1: Error Identification',
                '3.3.2':'3.3.2: Labels or Instructions',
                '3.3.3':'3.3.3: Error Suggestion',
                '3.3.4':'3.3.4: Error Prevention (Legal, Financial, Data)',
                '3.3.5':'3.3.5: Help',
                '3.3.6':'3.3.6: Error Prevention (All)'
            }
            break;
       case '4.1':
            structure = {
                '4.1.1':'4.1.1: Parsing',
                '4.1.2':'4.1.2: Name, Role, Value',
                '4.1.3':'4.1.3: Status Messages'
            }
            break; 
        default:
            break;
    }
    return structure;
}



function getSuccessCriterias() { 
    return [
        {
            "num": "1.1.1",
            "id": "non-text-content",
            "conformanceLevel": "A"
        },
        {
            "num": "1.2.1",
            "id": "audio-only-and-video-only-prerecorded",
            "conformanceLevel": "A"
        },
        {
            "num": "1.2.2",
            "id": "captions-prerecorded",
            "conformanceLevel": "A"
        },
        {
            "num": "1.2.3",
            "id": "audio-description-or-media-alternative-prerecorded",
            "conformanceLevel": "A"
        },
        {
            "num": "1.2.4",
            "id": "captions-live",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.2.5",
            "id": "audio-description-prerecorded",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.2.6",
            "id": "sign-language-prerecorded",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.2.7",
            "id": "extended-audio-description-prerecorded",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.2.8",
            "id": "media-alternative-prerecorded",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.2.9",
            "id": "audio-only-live",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.3.1",
            "id": "info-and-relationships",
            "conformanceLevel": "A"
        },
        {
            "num": "1.3.2",
            "id": "meaningful-sequence",
            "conformanceLevel": "A"
        },
        {
            "num": "1.3.3",
            "id": "sensory-characteristics",
            "conformanceLevel": "A"
        },
        {
            "num": "1.3.4",
            "id": "orientation",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.3.5",
            "id": "identify-input-purpose",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.3.6",
            "id": "identify-purpose",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.4.1",
            "id": "use-of-color",
            "conformanceLevel": "A"
        },
        {
            "num": "1.4.2",
            "id": "audio-control",
            "conformanceLevel": "A"
        },
        {
            "num": "1.4.3",
            "id": "contrast-minimum",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.4.4",
            "id": "resize-text",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.4.5",
            "id": "images-of-text",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.4.6",
            "id": "contrast-enhanced",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.4.7",
            "id": "low-or-no-background-audio",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.4.8",
            "id": "visual-presentation",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.4.9",
            "id": "images-of-text-no-exception",
            "conformanceLevel": "AAA"
        },
        { "num": "1.4.10", "id": "reflow", "conformanceLevel": "AA" },
        {
            "num": "1.4.11",
            "id": "non-text-contrast",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.4.12",
            "id": "text-spacing",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.4.13",
            "id": "content-on-hover-or-focus",
            "conformanceLevel": "AA"
        },
        { "num": "2.1.1", "id": "keyboard", "conformanceLevel": "A" },
        {
            "num": "2.1.2",
            "id": "no-keyboard-trap",
            "conformanceLevel": "A"
        },
        {
            "num": "2.1.3",
            "id": "keyboard-no-exception",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.1.4",
            "id": "character-key-shortcuts",
            "conformanceLevel": "A"
        },
        {
            "num": "2.2.1",
            "id": "timing-adjustable",
            "conformanceLevel": "A"
        },
        {
            "num": "2.2.2",
            "id": "pause-stop-hide",
            "conformanceLevel": "A"
        },
        {
            "num": "2.2.3",
            "id": "no-timing",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.2.4",
            "id": "interruptions",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.2.5",
            "id": "re-authenticating",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.2.6",
            "id": "timeouts",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.3.1",
            "id": "three-flashes-or-below-threshold",
            "conformanceLevel": "A"
        },
        {
            "num": "2.3.2",
            "id": "three-flashes",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.3.3",
            "id": "animation-from-interactions",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.4.1",
            "id": "bypass-blocks",
            "conformanceLevel": "A"
        },
        {
            "num": "2.4.2",
            "id": "page-titled",
            "conformanceLevel": "A"
        },
        {
            "num": "2.4.3",
            "id": "focus-order",
            "conformanceLevel": "A"
        },
        {
            "num": "2.4.4",
            "id": "link-purpose-in-context",
            "conformanceLevel": "A"
        },
        {
            "num": "2.4.5",
            "id": "multiple-ways",
            "conformanceLevel": "AA"
        },
        {
            "num": "2.4.6",
            "id": "headings-and-labels",
            "conformanceLevel": "AA"
        },
        {
            "num": "2.4.7",
            "id": "focus-visible",
            "conformanceLevel": "AA"
        },
        {
            "num": "2.4.8",
            "id": "location",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.4.9",
            "id": "link-purpose-link-only",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.4.10",
            "id": "section-headings",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.5.1",
            "id": "pointer-gestures",
            "conformanceLevel": "A"
        },
        {
            "num": "2.5.2",
            "id": "pointer-cancellation",
            "conformanceLevel": "A"
        },
        {
            "num": "2.5.3",
            "id": "label-in-name",
            "conformanceLevel": "A"
        },
        {
            "num": "2.5.4",
            "id": "motion-actuation",
            "conformanceLevel": "A"
        },
        {
            "num": "2.5.5",
            "id": "target-size",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.5.6",
            "id": "concurrent-input-mechanisms",
            "conformanceLevel": "AAA"
        },
        {
            "num": "3.1.1",
            "id": "language-of-page",
            "conformanceLevel": "A"
        },
        {
            "num": "3.1.2",
            "id": "language-of-parts",
            "conformanceLevel": "AA"
        },
        {
            "num": "3.1.3",
            "id": "unusual-words",
            "conformanceLevel": "AAA"
        },
        {
            "num": "3.1.4",
            "id": "abbreviations",
            "conformanceLevel": "AAA"
        },
        {
            "num": "3.1.5",
            "id": "reading-level",
            "conformanceLevel": "AAA"
        },
        {
            "num": "3.1.6",
            "id": "pronunciation",
            "conformanceLevel": "AAA"
        },
        { "num": "3.2.1", "id": "on-focus", "conformanceLevel": "A" },
        { "num": "3.2.2", "id": "on-input", "conformanceLevel": "A" },
        {
            "num": "3.2.3",
            "id": "consistent-navigation",
            "conformanceLevel": "AA"
        },
        {
            "num": "3.2.4",
            "id": "consistent-identification",
            "conformanceLevel": "AA"
        },
        {
            "num": "3.2.5",
            "id": "change-on-request",
            "conformanceLevel": "AAA"
        },
        {
            "num": "3.3.1",
            "id": "error-identification",
            "conformanceLevel": "A"
        },
        {
            "num": "3.3.2",
            "id": "labels-or-instructions",
            "conformanceLevel": "A"
        },
        {
            "num": "3.3.3",
            "id": "error-suggestion",
            "conformanceLevel": "AA"
        },
        {
            "num": "3.3.4",
            "id": "error-prevention-legal-financial-data",
            "conformanceLevel": "AA"
        },
        { "num": "3.3.5", "id": "help", "conformanceLevel": "AAA" },
        {
            "num": "3.3.6",
            "id": "error-prevention-all",
            "conformanceLevel": "AAA"
        },
        { "num": "4.1.1", "id": "parsing", "conformanceLevel": "A" },
        {
            "num": "4.1.2",
            "id": "name-role-value",
            "conformanceLevel": "A"
        },
        {
            "num": "4.1.3",
            "id": "status-messages",
            "conformanceLevel": "AA"
        }
    ]
};