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

  /**
   * Listener for the clear data button click
   */
  $("#btn_clear_data").click(() => {
      localStorage.removeItem('json');
      localStorage.removeItem('json_resultados');
      localStorage.removeItem("tabla_resultados");
      localStorage.removeItem("tabla_main");
      localStorage.removeItem("ultimo");
      window.location.reload();
  });

  /**
   * Listener for the logo image click
   */
  $("#react_extension_logo_image").click(() => {
    window.open("https://github.com/larraagirrejulen/GrAL", '_blank');
    window.open("https://github.com/Itusil/TFG", '_blank')
  });

  /**
   * Listener for the download button report click
   */
  $("#btn_download").click(() => {
    var jsonT = localStorage.getItem("json");
    var json = JSON.parse(jsonT);

    var title = json.defineScope.scope.title;
    download(title+".json", JSON.stringify(json));

    if (window.confirm("Do you want to upload the report on W3C?")) window.open("https://www.w3.org/WAI/eval/report-tool/", '_blank');
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