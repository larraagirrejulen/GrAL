

function performA11yEvaluation(){

    var jsonld = new JsonLd("a11y", window.document.location.href, window.document.title);

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

    var ruleResult, outcome, description, messages, xpath, html, results;

    for(let i = 0; i < ruleResults.length; i++) {

        ruleResult = ruleResults[i];
        switch(ruleResult.getResultValue()){
            case 1: //NOT_APPLICABLE
                outcome = "INNAPLICABLE" // earl:NotApplicable
                break;
            case 2 || 4: //PASS or WARNING
                outcome = "PASS"
                break;
            case 3: //MANUAL_CHECK
                outcome = "CANNOTTELL"
                break;
            case 5: //VIOLATION
                outcome = "FAIL"
                break;
            default:
                continue;
        }

        messages = ruleResult.getResultMessagesArray().filter(message => message !== "N/A");
        description = ruleResult.getRuleSummary() + messages.join("\n\n");
        results = ruleResult.getElementResultsArray();

        if (results.length <= 0 || outcome === "INAPPLICABLE"){
            jsonld.addNewAssertion(ruleResult.getRule().getPrimarySuccessCriterion().id, outcome, description);
        }else{
            for(let j = 0; j < results.length; j++) {
                var xpath = results[j].getDOMElement().xpath;
                xpath = xpath.replace(/\[@id='(.+?)'\]\[@class='(.+?)'\]/g, "[@id='$1']");
                xpath = xpath.replace(/\[@id='(.+?)'\]\[@role='(.+?)'\]/g, "[@id='$1']");
                html = results[j].getDOMElement().node.outerHTML;
                jsonld.addNewAssertion(ruleResult.getRule().getPrimarySuccessCriterion().id, outcome, description, xpath, html);
            }
        }

    }

    localStorage.setItem("a11yEvaluationReport", JSON.stringify(jsonld.getJsonLd()));
}

try{
    performA11yEvaluation();
} catch(error) {
    console.log("@a11yEvaluation.js: error performing the evaluation => " + error);
}

