
/**
 * This listener is in charge of turning the extension on and off.
 * It also listens and handles received runtime messages.
 * */ 

try{

  chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({'toggle':true});
  });

  chrome.action.onClicked.addListener((tab) => {
    chrome.storage.sync.get(['toggle'], function(result) {
      chrome.storage.sync.set({'toggle': !result.toggle});
      chrome.action.setIcon({path: result.toggle ? "/images/icon32G.png" : "/images/icon32.png"});
    });
    chrome.scripting.executeScript({ 
      target: {tabId: tab.id},
      func: ()=>{window.location.reload();}
    });
  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.storage.sync.get(['toggle'], function(result) {
      if(changeInfo.status == 'complete' && result.toggle){
        chrome.scripting.executeScript({
          files: ["content.js", "/libraries/a11yAinspector.js", "/libraries/jquery.min.js", "/js/jsonLd.js", '/js/jquery_find_elements.js'],
          target: {tabId: tab.id}
        });
      }
    });
  });


  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { 
    if(request.action === "openOptionsPage"){
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // save the tab ID for the options page
        chrome.storage.sync.set({ tabId: tabs[0].id });
        chrome.runtime.openOptionsPage();
      });
    }else if(request.action === "performA11yEvaluation"){

      chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
        await chrome.scripting.executeScript({
          files: ["/js/performA11yEvaluation.js"],
          target: {tabId: tabs[0].id}
        });
        sendResponse({result:"success"});
      });
      
    }
    return true;  // for asynchronous response
  });

} catch(error) { console.error(" @Background ERROR => " + error); }
