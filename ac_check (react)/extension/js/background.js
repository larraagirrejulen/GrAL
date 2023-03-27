

/**
 * Function that adds the listener for the click on the icon of the extension.
 * 
 * This listener is in charge of turning the extension on and off. It changes the logo's
 * colour to know the status of the extension.
 * */ 
function main_bk(){
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
            files: ["js/extensionListeners.js", "/js/libraries/a11yAinspector.js", "/js/libraries/jquery.min.js", "content.js", "/js/agregar_informes.js", '/js/jquery_find_elements.js'],
            target: {tabId: tab.id}
          });
        }
      });
    });
  

    /**
     * Background request handling listener
     */
    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

      action = request.action;

      console.log(" @Background: " + action + " request received ...");

      try{

        switch(action){
          case "openOptionsPage":
            chrome.runtime.openOptionsPage();
            break;
          case "performA11yEvaluation":
            jsonld = await (async () => {
              const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
              const response = await chrome.tabs.sendMessage(tab.id, {action: "performA11yEvaluation", jsonld: jsonld});            
              return response.evaluationResult;
            })();
            sendResponse({evaluationResult: jsonld});
            break;
          default:
            console.log(" @Background: " + action + " request does not exist !!!");
            return;
        }

      } catch(error) {
        console.error(" @Background: " + action + " request ERROR => " + error);
        return;
      }

      console.log(" @Background: " + action + " request completed !!!");
    });  
  

}


try{
  main_bk();
}catch(e){
  console.log(e);
}