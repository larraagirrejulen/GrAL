/** 
 * Update is used to analyse the newly added data, whether obtained automatically or manually,
 * by adding a report.
 * 
 * With that data, it creates the results table.
 */
function update(){
    var jsonT = localStorage.getItem("json");
    var json = JSON.parse(jsonT);
    var a_s = json.auditSample;
    let longitud = json.auditSample.length;
    //Length is 50 in AA

    var c_passed = 0;
    var c_failed = 0;
    var c_cannot_tell = 0;
    var c_not_present = 0;
    var c_not_checked = 0;

    var codigos = codigos_por_nombres();

    var obj;
    var res;
    var estandar;
    var json_resultados = {};
    for (var i = 0; i <longitud; i++){
        obj = json.auditSample[i];
        estandar = obj.test.id;
        codigo_estandar = codigos[estandar];
        res = obj.result.outcome.id;
        mensaje = obj.result.description;
        switch(res) {
            case "earl:failed":
                c_failed = c_failed+1;
                break;
            case "earl:untested":
                c_not_checked = c_not_checked+1;
                break;
            case "earl:cantTell":
                c_cannot_tell = c_cannot_tell+1;
                break;
            case "earl:passed":
                c_passed = c_passed+1;
                break;
            case "earl:inapplicable":
                c_not_present = c_not_present+1;
                break;
            default:
        }

        json_resultados[codigo_estandar] = {
            'result' : res,
            "Codigos": obj.result.codigo_error,
            'mensaje': mensaje
        };
    }

    var len = Object.keys(json_resultados).length;
    console.log("Len; "+len);
    localStorage.setItem('json_resultados',JSON.stringify(json_resultados));

    var html_results = "<div style='text-align:center'><br>";
    html_results += "<table class='tabla_RES'><tr><th style='background-color:#C8FA8C !important;' title='Passed'>P</th>";
    html_results += "<th style='background-color:#FA8C8C !important;' title='Failed'>F</th><th style='background-color:#F5FA8C !important;' title='Can&#39;t tell'>CT</th>";
    html_results += "<th title='Not Present' style='background-color:#FFFFFF !important;'>NP</th><th style='background-color:#8CFAFA !important;' title='Not checked'>NC</th></tr>";
    html_results += "<tr><th style='background-color:#FFFFFF !important;'>"+c_passed+"</th><th style='background-color:#FFFFFF !important;'>"+c_failed+"</th><th style='background-color:#FFFFFF !important;'>"+c_cannot_tell+"</th><th style='background-color:#FFFFFF !important;'>"+c_not_present+"</th><th style='background-color:#FFFFFF !important;'>"+c_not_checked+"</th></tr>"

    html_results += "</table></div>";

    localStorage.setItem("tabla_resultados",html_results);
    document.getElementById('tabla_res').innerHTML=html_results;


    var tabla_contenido= "<table class='tabla_contenido' style='width:100%; font-size:10px'>";
    tabla_contenido += "<tr><th style='width:68% !important;font-size:12px !important;background-color:white !important'>Standard</th><th style='background-color:#C8FA8C' title='Passed'>P</th>";
    tabla_contenido += "<th style='background-color:#FA8C8C' title='Failed'>F</th><th style='background-color:#F5FA8C' title='Can&#39;t tell'>CT</th>";
    tabla_contenido += "<th title='Not Present' style='background-color:#FFFFFF !important;'>NP</th><th style='background-color:#8CFAFA' title='Not checked'>NC</th></tr></table>";

    var sub_temas = sub_temasF('0');
    let st = "";
    for(var keyST in sub_temas){
        st = sub_temas[keyST];
        datos = get_datos(keyST);
        c_passed = datos[0];
        c_failed =  datos[1];
        c_cannot_tell =  datos[2];
        c_not_present =  datos[3];
        c_not_checked =  datos[4];
        tabla_contenido +='<button type="button" class="collapsible_tabla"><table style="width:100%; table-layout: fixed; overflow-wrap: break-word;""><tr><td style="width:70%">';
        tabla_contenido += st;
        tabla_contenido += '</td><td>'+c_passed+'</td><td>'+c_failed+'</td><td>'+c_cannot_tell+'</td><td>'+c_not_present+'</td><td>'+c_not_checked+'</td>';
        tabla_contenido += '</tr></table></button><div class="content_tabla">';
        tabla_contenido += print_subsections(keyST);
        tabla_contenido += '</div>';
    }

    localStorage.setItem("tabla_main",tabla_contenido);
    document.getElementById('tabla_contenido').innerHTML=tabla_contenido;
}


/** 
 * It is used to translate the code that comes from the report into the numerical standard.
 */
function codigos_por_nombres(){
    cod = {
    'WCAG21:non-text-content': '1.1.1',
    'WCAG21:audio-only-and-video-only-prerecorded': '1.2.1',
    'WCAG21:captions-prerecorded':'1.2.2',
    'WCAG21:audio-description-or-media-alternative-prerecorded': '1.2.3',
    'WCAG21:captions-live': '1.2.4',
    'WCAG21:audio-description-prerecorded':'1.2.5',
    'WCAG21:info-and-relationships' : '1.3.1',
    'WCAG21:meaningful-sequence' : '1.3.2',
    'WCAG21:sensory-characteristics': '1.3.3',
    'WCAG21:orientation' :'1.3.4',
    'WCAG21:identify-input-purpose' : '1.3.5',
    'WCAG21:use-of-color' : '1.4.1',
    'WCAG21:audio-control' : '1.4.2',
    'WCAG21:contrast-minimum' : '1.4.3',
    'WCAG21:resize-text' : '1.4.4',
    'WCAG21:images-of-text' : '1.4.5',
    'WCAG21:reflow' : '1.4.10',
    'WCAG21:non-text-contrast' : '1.4.11',
    'WCAG21:text-spacing' : '1.4.12',
    'WCAG21:content-on-hover-or-focus' : '1.4.13',
    'WCAG21:keyboard' : '2.1.1',
    'WCAG21:no-keyboard-trap' : '2.1.2',
    'WCAG21:character-key-shortcuts' : '2.1.4',
    'WCAG21:timing-adjustable' : '2.2.1',
    'WCAG21:pause-stop-hide' : '2.2.2',
    'WCAG21:three-flashes-or-below-threshold' : '2.3.1',
    'WCAG21:bypass-blocks' : '2.4.1',
    'WCAG21:page-titled' : '2.4.2',
    'WCAG21:focus-order': '2.4.3',
    'WCAG21:link-purpose-in-context' : '2.4.4',
    'WCAG21:multiple-ways' :'2.4.5',
    'WCAG21:headings-and-labels' : '2.4.6',
    'WCAG21:focus-visible' : '2.4.7',
    'WCAG21:pointer-gestures' : '2.5.1',
    'WCAG21:pointer-cancellation' : '2.5.2',
    'WCAG21:label-in-name' : '2.5.3',
    'WCAG21:motion-actuation' : '2.5.4',
    'WCAG21:language-of-page' : '3.1.1',
    'WCAG21:language-of-parts' :'3.1.2',
    'WCAG21:on-focus' : '3.2.1',
    'WCAG21:on-input' : '3.2.2',
    'WCAG21:consistent-navigation' : '3.2.3',
    'WCAG21:consistent-identification' : '3.2.4',
    'WCAG21:error-identification' : '3.3.1',
    'WCAG21:labels-or-instructions' : '3.3.2',
    'WCAG21:error-suggestion' : '3.3.3',
    'WCAG21:error-prevention-legal-financial-data' : '3.3.4',
    'WCAG21:parsing' : '4.1.1',
    'WCAG21:name-role-value' : '4.1.2',
    'WCAG21:status-messages' : '4.1.3'
    }
    return cod
}

/**
 * Given a standard or sub-standard, returns the subsections of that standard or sub-standard.
 */
function sub_temasF(estandar){
    var respuesta = {};
    switch(estandar){
        case '0':
            respuesta ={
                '1': '1 Perceivable',
                '2': '2 Operable',
                '3': '3 Understandable',
                '4': '4 Robust'
            };
            break;
        case '1':
            respuesta = {
                '1.1': '1.1 Text Alternatives',
                '1.2': '1.2 Time-based Media',
                '1.3': '1.3 Adaptable',
                '1.4': '1.4 Distinguishable'
            };
            break;
        case '2':
            respuesta = {
                '2.1': '2.1 Keyboard Accessible',
                '2.2': '2.2 Enough Time',
                '2.3': '2.3 Seizures and Physical Reactions',
                '2.4': '2.4 Navigable',
                '2.5': '2.5 Input Modalities'
            }
            break;
        case '3':
            respuesta = {
                '3.1': '3.1 Readable',
                '3.2': '3.2 Predictable',
                '3.3': '3.3 Input Assistance',
            }
            break;
        case '4':
            respuesta = {
                '4.1' : '4.1 Compatible'
            }
            break;

        case '1.1':
            respuesta = {
                '1.1.1' : '1.1.1: Non-text Content',
            }
            break;
        case '1.2':
            respuesta = {
                '1.2.1':'1.2.1: Audio-only and Video-only (Prerecorded)',
                '1.2.2':'1.2.2: Captions (Prerecorded)',
                '1.2.3':'1.2.3: Audio Description or Media Alternative (Prerecorded)',
                '1.2.4':'1.2.4: Captions (Live)',
                '1.2.5':'1.2.5: Audio Description (Prerecorded)',
            }
            break;
        case '1.3':
            respuesta = {
                '1.3.1':'1.3.1: Info and Relationships',
                '1.3.2':'1.3.2: Meaningful Sequence',
                '1.3.3':'1.3.3: Sensory Characteristics',
                '1.3.4':'1.3.4: Orientation',
                '1.3.5':'1.3.5: Identify Input Purpose',
            }
            break;
        case '1.4':
            respuesta = {
                '1.4.1':'1.4.1: Use of Color',
                '1.4.2':'1.4.2: Audio Control',
                '1.4.3':'1.4.3: Contrast (Minimum)',
                '1.4.4':'1.4.4: Resize tex',
                '1.4.5':'1.4.5: Images of Text',
                '1.4.10':'1.4.10: Reflow',
                '1.4.11':'1.4.11: Non-text Contrast',
                '1.4.12':'1.4.12: Text Spacing',
                '1.4.13':'1.4.13: Content on Hover or Focus',

            }
            break;
        case '2.1':
            respuesta = {
                '2.1.1':'2.1.1: Keyboard',
                '2.1.2':'2.1.2: No Keyboard Trap',
                '2.1.4':'2.1.4: Character Key Shortcuts',
            }
            break;
        case '2.2':
            respuesta = {
                '2.2.1':'2.2.1: Timing Adjustable',
                '2.2.2':'2.2.2: Pause, Stop, Hide',
            }
            break;
        case '2.3':
            respuesta = {
                '2.3.1':'2.3.1: Three Flashes or Below Threshold'
            }
            break;
        case '2.4':
            respuesta = {
                '2.4.1':'2.4.1: Bypass Blocks',
                '2.4.2':'2.4.2: Page Titled ',
                '2.4.3':'2.4.3: Focus Order',
                '2.4.4':'2.4.4: Link Purpose (In Context)',
                '2.4.5':'2.4.5: Multiple Ways',
                '2.4.6':'2.4.6: Headings and Labels',
                '2.4.7':'2.4.7: Focus Visible'
            }
            break;
        case '2.5':
            respuesta = {
                '2.5.1':'2.5.1: Pointer Gestures',
                '2.5.2':'2.5.2: Pointer Cancellation',
                '2.5.3':'2.5.3: Label in Name',
                '2.5.4':'2.5.4: Motion Actuation'
            }
            break;
        case '3.1':
            respuesta = {
                '3.1.1':'3.1.1: Language of Page',
                '3.1.2':'3.1.2: Language of Parts'
            }
            break;
        case '3.2':
            respuesta = {
                '3.2.1':'3.2.1: On Focus',
                '3.2.2':'3.2.2: On Input',
                '3.2.3':'3.2.3: Consistent Navigation',
                '3.2.4':'3.2.4: Consistent Identification'
            }
            break;
        case '3.3':
            respuesta = {
                '3.3.1':'3.3.1: Error Identification',
                '3.3.2':'3.3.2: Labels or Instructions',
                '3.3.3':'3.3.3: Error Suggestion',
                '3.3.4':'3.3.4: Error Prevention (Legal, Financial, Data)'
            }
            break;
       case '4.1':
            respuesta = {
                '4.1.1':'4.1.1: Parsing',
                '4.1.2':'4.1.2: Name, Role, Value',
                '4.1.3':'4.1.3: Status Messages'
            }
            break; 

    }
    return respuesta;
}

/**
 * Prints out the subsections of the "s" section in HTML and returns it
 */
function print_subsections(s){
    var sub_temas = sub_temasF(s);
    let st = "";
    let sst = "";
    var codigo_nav_st = "";
    for(var keyST in sub_temas){
        datos = get_datos(keyST);
        c_passed = datos[0];
        c_failed =  datos[1];
        c_cannot_tell =  datos[2];
        c_not_present =  datos[3];
        c_not_checked =  datos[4];
        st = sub_temas[keyST];
        codigo_nav_st +='<button type="button" class="collapsible_tabla2"><table style="width:100%; table-layout: fixed; overflow-wrap: break-word;""><tr><td style="font-size:10px;width:70%; white-space:normal;text-align: left;">';
        codigo_nav_st += st;
        codigo_nav_st += '</td><td style="font-size:10px;">'+c_passed+'</td><td style="font-size:10px;">'+c_failed+'</td><td style="font-size:10px;">'+c_cannot_tell+'</td><td style="font-size:10px;">'+c_not_present+'</td><td style="font-size:10px;">'+c_not_checked+'</td>';
        codigo_nav_st += '</tr></table></button><div class="content_tabla">';
        sst = sub_temasF(keyST);
        if (Object.keys(sst).length >0){
            codigo_nav_st += print_sub_subsubsections(keyST);
        }
        codigo_nav_st+='</div>';
    }
    return codigo_nav_st;
}

/** 
 * Given a sub-substandard as a parameter, obtains the results in terms of failures, passes, warnings,
 * not present and not checked for that sub-substandard and returns it as an array, 
 */
function get_datos(keyST){
    var json_resultados = localStorage.getItem('json_resultados');
    json_resultados = JSON.parse(json_resultados);

    c_passed = 0;
    c_failed = 0;
    c_cannot_tell = 0;
    c_not_present = 0;
    c_not_checked = 0;
    for (var key in json_resultados) {
        if (key.startsWith(keyST)){
            res = json_resultados[key].result; 
            switch(res) {
                case "earl:failed":
                    c_failed = c_failed+1;
                    break;
                case "earl:untested":
                    c_not_checked = c_not_checked+1;
                    break;
                case "earl:cantTell":
                    c_cannot_tell = c_cannot_tell+1;
                    break;
                case "earl:passed":
                    c_passed = c_passed+1;
                    break;
                case "earl:inapplicable":
                    c_not_present = c_not_present+1;
                    break;
                default:
            }
        }
    }
    return [c_passed, c_failed, c_cannot_tell, c_not_present, c_not_checked];
}

/**
 * Prints the subsubsections of the subsection passed as parameter and returns it as HTML string
 */
function print_sub_subsubsections(estandar){
    var jsonT__ = localStorage.getItem("json");
    var json__ = JSON.parse(jsonT__);
    var sub_temas = sub_temasF(estandar);
    let st = "";
    let style = "";
    var codigo_nav_st = "";
    let result_text ="";
    let len = 0;
    var json_resultados = localStorage.getItem('json_resultados');
    let manual = false;

    json_resultados = JSON.parse(json_resultados);
    for(var keyST in sub_temas){
        len = 0;
        if(keyST in json_resultados){
            res = json_resultados[keyST].result; 
            switch(res) {
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
            }
            let obj = json_resultados[keyST];
            if("Codigos" in obj){
                let codigos = json_resultados[keyST]['Codigos'];
                len = codigos.length;
            }else{
                len = 0;
            }
            
        }else{
            console.log('No en el documento: '+keyST);
            style = "background-color:#8CFAFA";
            result_text = "NOT CHECKED";
        }
        
        //Text could be painted bacause it was made auot or manual.
        //Manual has len = 0, we need to check if 
        //First we get the WCAG name
        let mensaje_wcag_manual = '';
        if(len == 0){
            mensaje_wcag_manual =json_resultados[keyST].mensaje; 
            manual = false;
            if(mensaje_wcag_manual!== ''){
                manual = true;
            }
        }

        st = sub_temas[keyST];
        codigo_nav_st +='<button type="button" class="collapsible_tabla3" style="'+style+'"><table style="width:100%; table-layout: fixed; overflow-wrap: break-word;""><tr>';
        
        if(len>0 || manual){
            codigo_nav_st += '<td style="width:15%;"><img src="http://127.0.0.1:5000/flecha.png" alt="Show information" height="20px"></td>';
            codigo_nav_st += '<td style="width:55%;  font-size:10px;  text-align: left;">'+st+'</td>';
        }else{
            codigo_nav_st += '<td style="width:70%;  font-size:10px;  text-align: left;">'+st+'</td>';
        }
        codigo_nav_st += '<td style="font-size:9px"><b>'+result_text+'</b></td>';
        codigo_nav_st += '</tr></table></button><div class="content_tabla">';
        
        if(len>0){
            codigo_nav_st += print_report_result(keyST);
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
function print_report_result(keyST){
    var json_resultados = localStorage.getItem('json_resultados');
    json_resultados = JSON.parse(json_resultados);
    let obj = json_resultados[keyST]['Codigos'];
    var arrayLength = obj.length;

    let html = "";
    html += '<table class="tabla_resultados">';
    for (var i = 0; i < arrayLength; i++) {
        codigo = obj[i]['codigo'];
        tipo = obj[i]['tipo'];
        texto = obj[i]['texto'];
        linea = obj[i]['linea'];
        web = obj[i]['web'];

        texto = texto.replaceAll('<','&lt;');
        texto = texto.replaceAll('>','&gt;');
        texto = texto.replaceAll('&lt;','<code>&lt;');
        texto = texto.replaceAll('&gt;','&gt;</code>');

        html += '<tr><td><u>Analizer</u>:  <b>'+web+'</b></td></tr>';
        html += '<tr><td><u>Result</u>:  <b>'+tipo+'</b></td></tr>';
        html += '<tr><td><u>Message:</u></td></tr>';
        html += '<tr><td>'+texto+'</td></tr>';
        if("solucion" in obj[i]){
            html += '<tr><td><u>Posible solution</u>:</td></tr>';
            html += '<tr><td>'+obj[i]['solucion']+'</td></tr>';
        }
        let c_len = codigo.length;
        if(c_len>0){
            html += '<tr><td><u>Code</u>:</td></tr>';
            html += '<tr><td>';
            for (var j = 0; j < c_len; j++) {
                codigot = codigo[j]['texto_codigo'].replaceAll('<','&lt;');
                codigot = codigot.replaceAll('>','&gt;');

                let loc = ""; 
                if('location' in codigo[j]){
                    loc = 'alt="'+codigo[j]['location']+'"';
                }

                html += '<code class="codigo_analisis" style="cursor: pointer;"'+loc+'>'+codigot+'</code>';
            }
            html += '<br><br></td></tr>';
        }else{
            html = html.substring(0,html.length-10)+'<br><br></td></tr>';
        }
    }
    html += '</table>'; 

    return html;
}