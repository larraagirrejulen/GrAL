$(document).ready(function(){


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

            results.push({
                "successCriteriaNumber": ruleResult.getRule().getPrimarySuccessCriterion().id,
                "outcome": outcome,
                "description": description,
                "path": "",
                "html": ""
            });

            //console.log(getElementResultInfo(ruleResults[i]))

            info.allRuleResults.push(getRuleResultsItem(ruleResults[i]));
        }

        console.log(info);

        
    });
  
  
  });   