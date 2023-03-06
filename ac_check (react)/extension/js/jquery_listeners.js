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
    let evaluationResult = evaluator.evaluate(originalDoc, originalDoc.title, window.location.href);*/


    let evaluationResult = evaluator.evaluate(window.document, window.document.title, window.document.location.href);


    // Gure luzapenak jarritako html elementuak berriro jarri
    document.body.appendChild(extension);


    let info = {};

    let ruleGroupResult   = evaluationResult.getRuleResultsAll();
    let ruleSummaryResult = ruleGroupResult.getRuleResultsSummary();
    let ruleResults       = ruleGroupResult.getRuleResultsArray();

    info.ruleset  = evaluationResult.getRuleset().getId();

    info.violations    = ruleSummaryResult.violations;
    info.warnings      = ruleSummaryResult.warnings;
    info.manual_checks = ruleSummaryResult.manual_checks;
    info.passed        = ruleSummaryResult.passed;

    info.rcResults = getRuleCategoryResults(evaluationResult);
    info.glResults = getGuidelineResults(evaluationResult);
    info.json = evaluationResult.toJSON();

    info.allRuleResults = [];
    for(let i = 0; i < ruleResults.length; i++) {
      info.allRuleResults.push(getRuleResultsItem(ruleResults[i]));
    }

    console.log(info);
  });


});