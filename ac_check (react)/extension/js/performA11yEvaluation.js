

(() => {

    try{

        const url = window.document.location.href;
        const title = window.document.title;
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

        const ruleResult2Outcome = {
            1: "earl:inapplicable", // NOT_APPLICABLE
            2: "earl:passed",   // PASS
            3: "earl:cantTell",  // MANUAL_CHECK
            5: "earl:failed"    // VIOLATION
        }

        for(const ruleResult of ruleResults) {

            const outcome = ruleResult2Outcome[ruleResult.getResultValue()];

            if (!outcome || !ruleResult.isRuleRequired()) continue;

            let description = ruleResult.getRuleSummary() + "\n\n";
            description += ruleResult.getResultMessagesArray().filter(message => message !== "N/A").join("\n\n");

            const successCriteria = ruleResult.getRule().getPrimarySuccessCriterion().id;
            const results = ruleResult.getElementResultsArray();

            if (results.length <= 0){
                jsonld.addNewAssertion(successCriteria, outcome, description);
            }else{
                for(const result of results) {
                    let xpath = result.getDOMElement().xpath;
                    xpath = "/" + xpath.substring(xpath.indexOf("]/")+1)
                    xpath = xpath.replace(/\[@id='([\w\s-]+?)'\]\[@role='([\w\s-]+?)'\]/g, "[@id='$1']");
                    xpath = xpath.replace(/\[@class='([\w\s-]+?)'\]/g, "");

                    const html = result.getDOMElement().node.outerHTML.replace(/[\n\t]/g, "");

                    jsonld.addNewAssertion(successCriteria, outcome, description, xpath, html);
                }
            }
        }

        return jsonld.getJsonLd();

    } catch(error) {
        throw new Error("@performA11yEvaluation.js: error performing the evaluation => " + error);
    }

})();



