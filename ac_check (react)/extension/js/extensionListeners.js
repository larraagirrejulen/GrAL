

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {

        action = request.action;

        console.log(" @extensionListeners.js : " + action + " request received ...");

        try{

            switch(action){
            case "performA11yEvaluation":
                var json = await performA11yEvaluation(request.jsonld)
                sendResponse({status: 0, evaluationResult: json});
                break;
            default:
                console.log(" @extensionListeners.js : " + action + " request does not exist !!!");
                return;
            }

        } catch(error) {
            console.error(" @extensionListeners.js : " + action + " request ERROR => " + error);
            sendResponse({ evaluationStatus: 1, error: error });
            return;
        }

        console.log(" @extensionListeners.js : " + action + " request completed !!!");
    }
);


async function performA11yEvaluation(jsonld){

    // Configure evaluator factory and get evaluator
    var evaluatorFactory = OpenAjax.a11y.EvaluatorFactory.newInstance();
    const ruleset = OpenAjax.a11y.RulesetManager.getRuleset('ARIA_STRICT');
    evaluatorFactory.setParameter('ruleset', ruleset);
    evaluatorFactory.setFeature('eventProcessing', 'fae-util');
    evaluatorFactory.setFeature('groups', 7);
    const evaluator = evaluatorFactory.newEvaluator();
  
    // Gure luzapenak jarritako html elementuak kendu
    const extension = window.document.getElementById("react-chrome-extension");
    extension.remove();
  
    const evaluationResult = evaluator.evaluate(window.document, window.document.title, window.document.location.href);
  
    // Gure luzapenak jarritako html elementuak berriro jarri
    document.body.appendChild(extension);
  
    const ruleResults = evaluationResult.getRuleResultsAll().getRuleResultsArray();
  
    var ruleResult, outcome, description, messages, xpath, html;
  
    for(let i = 0; i < ruleResults.length; i++) {
  
      ruleResult = ruleResults[i];
      
      switch(ruleResult.getResultValue()){
          case 1:
              outcome = "INNAPLICABLE"
              break;
          case 2:
              outcome = "PASS"
              break;
          case 3 || 4:
              outcome = "CANNOTTELL"
              break;
          case 5:
              outcome = "FAIL"
              break;
          default:
              continue;
      }

      messages = ruleResult.getResultMessagesArray().filter(message => message !== "N/A");
      description = ruleResult.getRuleSummary() + messages.join("\n\n");
      results = ruleResult.getElementResultsArray();

      if (results.length <= 0){
        jsonld.addNewAssertion(ruleResult.getRule().getPrimarySuccessCriterion().id, outcome, description);
      }

      for(let j = 0; j < results.length; j++) {
        xpath = results[j].getDOMElement().xpath;
        html = results[j].getDOMElement().node.outerHTML;
        jsonld.addNewAssertion(ruleResult.getRule().getPrimarySuccessCriterion().id, outcome, description, xpath, html);
      }

    }
  
    return jsonld.getJsonLd();
  }