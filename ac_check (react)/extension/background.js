
/**
 * This listener is in charge of turning the extension on and off.
 * It also listens and handles received runtime messages.
 * */ 

try{

  chrome.runtime.onInstalled.addListener(() => {
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


  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    chrome.storage.sync.get(['toggle'], function(result) {
      if(changeInfo.status == 'complete' && result.toggle){
        chrome.scripting.executeScript({
          files: ["content.js"],
          target: {tabId: tabId}
        });
      }
    });
  });


  chrome.runtime.onMessage.addListener((request, sender) => { 

    if(request.action === "openOptionsPage"){
      
      chrome.storage.session.set({ tabId: sender.tab.id }); // store the tab ID for the options page to reload the tab when saving options
      chrome.runtime.openOptionsPage();

    }else if(request.action === "showHiddenElement"){
      
      chrome.windows.create({ 
        url: "chrome://inspect/#devices", 
        type: "popup", 
        focused: true 
      });

    }
    return true;  // for asynchronous response
  });

} catch(error) { console.error(" @Background ERROR => " + error); }
