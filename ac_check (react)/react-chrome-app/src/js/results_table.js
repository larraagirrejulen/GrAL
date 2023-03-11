/** 
 * Update is used to analyse the newly added data, whether obtained automatically or manually,
 * by adding a report.
 * 
 * With that data, it creates the results table.
 */
export default function load_result_table(){
    var report = localStorage.getItem("json");
    var json = JSON.parse(report);


    var passed = {
        "A": 0,
        "AA": 0,
        "AAA": 0
    }
    var failed = {
        "A": 0,
        "AA": 0,
        "AAA": 0
    }
    var cannot_tell = {
        "A": 0,
        "AA": 0,
        "AAA": 0
    }
    var not_present = {
        "A": 0,
        "AA": 0,
        "AAA": 0
    }
    var not_checked = {
        "A": 0,
        "AA": 0,
        "AAA": 0
    }

    var criterias = getSuccessCriterias();
    var results = json[0]["auditSample"]
    var obj, level;
    var json_resultados = {};
    console.log( results);
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
                not_checked[level] = not_checked[level]+1;
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
    var mainCategories = get_table_structure('0');

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

    var subCategories = get_table_structure(categoryKey);
    var subsection_results = [];
    var subCategoryData, sub2section_results;

    for(var subCategoryKey in subCategories){

        subCategoryData = get_data_by_category(subCategoryKey);

        if (Object.keys(get_table_structure(subCategoryKey)).length > 0){
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
    var sub2Categories = get_table_structure(subCategoryKey);
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

    var passed = {
        "A": 0,
        "AA": 0,
        "AAA": 0
    }
    var failed = {
        "A": 0,
        "AA": 0,
        "AAA": 0
    }
    var cannot_tell = {
        "A": 0,
        "AA": 0,
        "AAA": 0
    }
    var not_present = {
        "A": 0,
        "AA": 0,
        "AAA": 0
    }
    var not_checked = {
        "A": 0,
        "AA": 0,
        "AAA": 0
    }

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
                    not_checked[level] = not_checked[level]+1;
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