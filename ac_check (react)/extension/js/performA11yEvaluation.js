

(() => {

    try{

        const url = window.document.location.href
        const title = window.document.title
        const jsonld = new JsonLd("a11y", url, title);

        // Configure evaluator factory and get evaluator
        const evaluatorFactory = OpenAjax.a11y.EvaluatorFactory.newInstance();
        evaluatorFactory.setParameter('ruleset', OpenAjax.a11y.RulesetManager.getRuleset('ARIA_STRICT'));
        evaluatorFactory.setFeature('eventProcessing', 'fae-util');
        evaluatorFactory.setFeature('groups', 7);
        const evaluator = evaluatorFactory.newEvaluator();

        // Remove our extension, perform evaluation, and set extension back
        const extension = window.document.getElementById("ac-check-extension");
        extension.remove();
        const evaluationResult = evaluator.evaluate(window.document, title, url);
        document.body.appendChild(extension);

        // Get interested results data and fill the jsonld evaluation report
        const ruleResults = evaluationResult.getRuleResultsAll().getRuleResultsArray();

        let outcome, description, xpath, html, results, successCriteria;

        for(let i = 0, ruleResult; ruleResult = ruleResults[i]; i++) {

            switch(ruleResult.getResultValue()){
                case 1:
                    outcome = "earl:inapplicable" // NOT_APPLICABLE
                    break;
                case 2:
                    outcome = "earl:passed" // PASS
                    break;
                case 3:
                    outcome = "earl:cantTell" // MANUAL_CHECK
                    break;
                case 5:
                    outcome = "earl:failed" // VIOLATION
                    break;
                default:
                    continue;
            }

            description = ruleResult.getResultMessagesArray().filter(message => message !== "N/A");
            description = ruleResult.getRuleSummary() + description.join("\n\n");
            successCriteria = ruleResult.getRule().getPrimarySuccessCriterion().id;
            results = ruleResult.getElementResultsArray();

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

    } catch(error) {
        throw new Error("@performA11yEvaluation.js: error performing the evaluation => " + error);
    }

})();



