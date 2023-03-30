

function performA11yEvaluation(){

    const url = window.document.location.href
    const title = window.document.title
    const jsonld = new JsonLd("a11y", url, title);

    // Configure evaluator factory and get evaluator
    const evaluatorFactory = OpenAjax.a11y.EvaluatorFactory.newInstance();
    evaluatorFactory.setParameter('ruleset', OpenAjax.a11y.RulesetManager.getRuleset('ARIA_STRICT'));
    evaluatorFactory.setFeature('eventProcessing', 'fae-util');
    evaluatorFactory.setFeature('groups', 7);
    const evaluator = evaluatorFactory.newEvaluator();

    // Remove our extension for a legit evaluation and set it back
    const extension = window.document.getElementById("ac-check-extension");
    extension.remove();
    const evaluationResult = evaluator.evaluate(window.document, title, url);
    document.body.appendChild(extension);


    const ruleResults = evaluationResult.getRuleResultsAll().getRuleResultsArray();

    let outcome, description, xpath, html, results, successCriteria;

    for(let i = 0, ruleResult; ruleResult = ruleResults[i]; i++) {

        switch(ruleResult.getResultValue()){
            case 1:
                outcome = "inapplicable" // NOT_APPLICABLE => earl:inapplicable
                break;
            case 2:
                outcome = "passed" // PASS => earl:passed
                break;
            case 3:
                outcome = "cantTell" // MANUAL_CHECK => earl:cantTell
                break;
            case 5:
                outcome = "failed" // VIOLATION => earl:failed
                break;
            default:
                continue;
        }

        description = ruleResult.getResultMessagesArray().filter(message => message !== "N/A");
        description = ruleResult.getRuleSummary() + description.join("\n\n");
        results = ruleResult.getElementResultsArray();
        successCriteria = ruleResult.getRule().getPrimarySuccessCriterion().id;

        if (results.length <= 0){
            jsonld.addNewAssertion(successCriteria, outcome, description);
        }else{
            for(let j = 0, result; result = results[j]; j++) {

                xpath = result.getDOMElement().xpath;
                xpath = xpath.replace(/\[@id='(.+?)'\]\[@class='(.+?)'\]/g, "[@id='$1']");
                xpath = xpath.replace(/\[@id='(.+?)'\]\[@role='(.+?)'\]/g, "[@id='$1']");
                html = result.getDOMElement().node.outerHTML;
                jsonld.addNewAssertion(successCriteria, outcome, description, xpath, html);

            }
        }

    }

    return jsonld.getJsonLd();

}

try{
    performA11yEvaluation();
} catch(error) {
    console.log("@performA11yEvaluation.js: error performing the evaluation => " + error);
}

