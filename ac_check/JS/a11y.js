

function a11y(){
    // Get document info from browser context
    doc = window.document;
    url = window.location.href;

    // Get and configure an evaluatorFactory
    let evaluatorFactory = OpenAjax.a11y.EvaluatorFactory.newInstance();

    // A tools developer wants to use the ARIAStrictRuleset
    var asRuleset = OpenAjax.a11y.RulesetManager.getRuleset('ARIA_STRICT');

    // and configure it...
    evaluatorFactory.setParameter('ruleset', asRuleset);
    evaluatorFactory.setFeature('eventProcessing',   'none');
    evaluatorFactory.setFeature('brokenLinkTesting', false);

    // Get the evaluator
    let evaluator = evaluatorFactory.newEvaluator();

    // Gure luzapenak jarritako html elementuak kendu
    const element = doc.getElementById("sidenav_s");
    element.remove();
    /*const ancestor = doc.getElementById("main_s");
    descendents = ancestor.getElementsByTagName('*');
    ancestor.remove();
    for (i = 0; i < descendents.length; ++i) {
      doc.body.appendChild(descendents[i]);
      console.log(descendents[i]);
    }
    alert("aaaaa");*/

    // Evaluate
    result = evaluator.evaluate(doc, doc.title, url);

    // Gure luzapenak jarritako html elementuak berriro jarri
    /*descendents = doc.body.getElementsByTagName('*');
    for (i = 0; i < descendents.length; ++i) {
      descendents[i].remove();
    }
    doc.body.appendChild(ancestor);*/
    doc.body.appendChild(element);

    console.log(result);

    // Get evaluation results
    data = result.getRuleset().toJSON();
    json = JSON.parse(data);

    // Print results
    var v = 0;
    var w = 0;
    var p = 0;
    var m = 0;
    var h = 0;
    for (rule in json.rule_mappings){
      ers = result.getRuleResult(rule).getElementResultsSummary();
      if (ers.violations>=1) v += 1;
      if (ers.warnings>=1) w += 1;
      if (ers.passed>=1) p += 1;
      if (ers.manual_checks>=1) m += 1;
      if (ers.hidden>=1) h += 1;
    }
    console.log("violations: ", v);
    console.log("warnings: ", w);
    console.log("passed: ", p);
    console.log("manual_checks: ", m);
    console.log("hidden: ", h);
}





function format_informe(url, informe){
    informe_nuevo = crear_JSON_limpio();
    informe_nuevo['reportFindings']['evaluator'] = 'A11Y Evaluation Library'
    informe_nuevo['reportFindings']['commissioner'] = 'AUTHOMATIC'
    
    // De aqui para abajo falta adaptar
    informe_nuevo['defineScope']['scope'] = {
        "description": str(description),
        "title": str(url)
    }

    //Queda por meter description y fecha
    for (i in range(0,len(informe_nuevo['auditSample']))){
        tipo = informe_nuevo['auditSample'][i]['test']['id']
        if (tipo in informe){
            obj = informe[tipo]
            if (obj['Resultado'] =='Failed'){
                informe_nuevo['auditSample'][i]['result']['outcome'] ={
                    "id": "earl:failed",
                    "type": ["OutcomeValue", "Fail"],
                    "title":"Failed"
                }
            }else if (obj['Resultado'] == 'Cannot Tell'){
                informe_nuevo['auditSample'][i]['result']['outcome'] = {
                    "id": "earl:cantTell",
                    "type": ["OutcomeValue", "CannotTell"],
                    "title": "Cannot tell"
                }
            }else if (obj['Resultado'] == 'Not checked'){
                informe_nuevo['auditSample'][i]['result']['outcome'] = {
                    "id": "earl:untested",
                    "type": ["OutcomeValue", "NotTested"],
                    "title": "Not checked"
                }
            }else{
                informe_nuevo['auditSample'][i]['result']['outcome'] = {
                    "id": "earl:passed",
                    "type": ["OutcomeValue", "Pass"],
                    "title": "Passed"
                }
            }
            informe_nuevo['auditSample'][i]['result']['description'] = obj['Texto']
            informe_nuevo['auditSample'][i]['result']['codigo_error'] = obj['Codigos']
        }
    }
    return informe_nuevo;
}