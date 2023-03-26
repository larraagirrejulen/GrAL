$(document).ready(function(){


    function evaluateWithA11y(){
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

        return evaluationResult;
    }


    /*function getA11yEvaluationResults(){

    }*/


    $("#prueba").click(async () => {
  
        
        const evaluationResult = evaluateWithA11y();

        const ruleResults = evaluationResult.getRuleResultsAll().getRuleResultsArray();
    
        results = [];

        var ruleResult, description, outcome;

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

            description = ruleResult.getRuleSummary();

            ruleResult.getResultMessagesArray().forEach(message => {
                if(message !== "N/A"){
                    description += "\n\n" + message;
                }
            });

            var xpath, html;
            var results = ruleResult.getElementResultsArray();

            for(let j = 0; j < results.length; j++) {

                xpath = results[j].getDOMElement().xpath;
                html = results[j].getDOMElement().node.outerHTML;
                html = html.substring(0, html.indexOf(">")+1) + " ...";
                console.log(xpath);
                console.log(html);

            }

            results.push({
                "successCriteriaNumber": ruleResult.getRule().getPrimarySuccessCriterion().id,
                "outcome": outcome,
                "description": description,
                "path": "",
                "html": ""
            });

        }

        
    });
  
  
  });   