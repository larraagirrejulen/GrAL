


/**
 * Function that adds the listener for the click on the icon of the extension.
 * 
 * This listener is in charge of turning the extension on and off. It changes the logo's
 * colour to know the status of the extension.
 * */ 
function main_bk(){

  try{

    chrome.runtime.onInstalled.addListener(function() {
        chrome.storage.sync.set({'toggle':true});
    });

    chrome.action.onClicked.addListener((tab) => {
      chrome.storage.sync.get(['toggle'], function(result) {
        var toggle = result.toggle;
        if(!toggle){
          chrome.storage.sync.set({'toggle':true});
          chrome.action.setIcon({path: "/images/icon16.png"});
        }else{
          chrome.storage.sync.set({'toggle':false});
          chrome.action.setIcon({path: "/images/icon16G.png"});
        }
      });

      chrome.scripting.executeScript({ 
        target: {tabId: tab.id},
        func: ()=>{window.location.reload();}
      });
    });

    //ON page change
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      chrome.storage.sync.get(['toggle'], function(result) {
        var toggle = result.toggle;
        if(toggle){
          chrome.action.setIcon({path: "/images/icon16.png"});
        }else{
          chrome.action.setIcon({path: "/images/icon16G.png"});
        }
        if(changeInfo.status == 'complete' && toggle){
          chrome.action.setIcon({path: "/images/icon16.png"});
          chrome.scripting.executeScript({
            files: ["/js/libraries/a11yAinspector.js", "/js/libraries/jquery.min.js", "content.js", "/js/agregar_informes.js", '/js/jquery_find_elements.js'],
            target: {tabId: tab.id}
          });
        }
      });
    });
  

    /**
     * Background request handling listener
     */
    chrome.runtime.onMessage.addListener( function(request, sender, sendResponse){

      action = request.action;

      console.log(" @Background: " + action + " request received ...");

      try{

        switch(action){
          case "openOptionsPage":
            chrome.runtime.openOptionsPage();
            break;
          case "performA11yEvaluation":
            performA11yEvaluation(request.jsonld).then((jsonld) => {
              sendResponse({status: 0, evaluationResult: jsonld});
            })
            break;
          default:
            console.log(" @Background: " + action + " request does not exist !!!");
            return;
        }

      } catch(error) {
        console.error(" @Background: " + action + " request ERROR => " + error);
        sendResponse({ evaluationStatus: 1, error: error });
        return;
      }

      console.log(" @Background: " + action + " request completed !!!");
    });  


    
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
  
  }catch(e){
    console.log(e);
  }
}



main_bk();
