$(document).ready(function(){

  /** 
   * Listener to upload a new document
   */
  $(document).on('change', '#btn_upload', (event) => {
    var reader = new FileReader();
    reader.onload = function(event) {
      var jsonT = localStorage.getItem("json");
      var savedJson = JSON.parse(jsonT);
      var json = JSON.parse(event.target.result);
      
      if (savedJson != null) merge(json,savedJson);

      saveJson(JSON.stringify(json));
    }
    reader.readAsText(event.target.files[0]);
  });

  


  $("#prueba").click(async () => {

    // Configure evaluator factory and get evaluator
    let evaluatorFactory = OpenAjax.a11y.EvaluatorFactory.newInstance();
    var ruleset = OpenAjax.a11y.RulesetManager.getRuleset('ARIA_STRICT');
    evaluatorFactory.setParameter('ruleset', ruleset);
    evaluatorFactory.setFeature('eventProcessing', 'fae-util');
    evaluatorFactory.setFeature('groups', 7);
    let evaluator = evaluatorFactory.newEvaluator();

    // Gure luzapenak jarritako html elementuak kendu
    const extension = window.document.getElementById("react-chrome-extension");
    extension.remove();

    
    /*// Get the original document wihtout extension changes and current runtime state
    const originalDoc = getOriginalDocWithCurrentState();
    // Evaluate and save result
    result = evaluator.evaluate(originalDoc, originalDoc.title, window.location.href);*/
    




    const info = {};

    // evaluation script
    let doc = window.document;
    let evaluationLibrary = new EvaluationLibrary();
    let evaluationResult  = evaluationLibrary.evaluate(doc, doc.title, doc.location.href);

    const ruleGroupResults   = evaluationResult.getRuleResultsAll();
    const ruleSummaryResults = ruleGroupResults.getRuleResultsSummary();

    info.violations    = ruleSummaryResults.violations;
    info.warnings      = ruleSummaryResults.warnings;
    info.manual_checks = ruleSummaryResults.manual_checks;
    info.passed        = ruleSummaryResults.passed;

    info.rcResults = getRuleCategoryResults(evaluationResult);
    info.glResults = getGuidelineResults(evaluationResult);
    info.json = evaluationResult.toJSON();

    console.log(info);

    result = evaluator.evaluate(document, document.title, window.location.href);
    console.log(result);


    // Gure luzapenak jarritako html elementuak berriro jarri
    document.body.appendChild(extension);


    // Get evaluation results
    let ruleGroupResult   = result.getRuleResultsAll();
    let ruleSummaryResult = ruleGroupResult.getRuleResultsSummary();
    v = ruleSummaryResult.violations;
    w = ruleSummaryResult.warnings;
    p = ruleSummaryResult.manual_checks;
    m = ruleSummaryResult.passed;
    pa = ruleSummaryResult.page;
    h = ruleSummaryResult.hidden;
    console.log("violations: " + v + " warnings: " + w + " manual_checks: " + m + " passed: " + p + " page: " + pa + " h: " + h);

    let ruleResults = ruleGroupResult.getRuleResultsArray();
    console.log(ruleSummaryResult);
    console.log(ruleResults);
    var v = 0;
    var w = 0;
    var p = 0;
    var m = 0;
    var pa = 0;
    var h = 0;
    for(let i = 0; i < ruleResults.length; i++) {
      try{
        if(ruleResults[i].rule.rule_id.startsWith("LINK")){
          console.log(ruleResults[i]);
        }
        ers = ruleResults[i].getElementResultsSummary();
        if (ers.violations>=1) v += 1;
        if (ers.warnings>=1) w += 1;
        if (ers.passed>=1) p += 1;
        if (ers.manual_checks>=1) m += 1;
        if (ers.page>=1) pa += 1;
        if (ers.hidden>=1) h += 1;
      }
      catch (e){
        console.log("Error with rule " + rule + ": " + e)
      }
      
    }
    console.log("violations: " + v + " warnings: " + w + " manual_checks: " + m + " passed: " + p + " page: " + pa + " h: " + h);

  });


});