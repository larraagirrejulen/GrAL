
try{

  // Save selected options into chrome.storage
  document.getElementById('saveOptions').addEventListener('click', ()=>{

    const mantainExtended = document.getElementById('mantainExtended').checked;
    const shiftWebpage = document.getElementById('shiftWebpage').checked;

    chrome.storage.sync.set(
      { mantainExtended: mantainExtended, shiftWebpage: shiftWebpage },
      () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('saveStatus');
        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
        }, 1000);
      }
    );

    chrome.storage.session.get({ tabId: null },
      (items) => {
        if (items.tabId !== null) {
          // Reload the page from which the user opened options page
          chrome.scripting.executeScript({ 
            target: {tabId: items.tabId},
            func: ()=>{window.location.reload();}
          });
        }
      }
    );
  });


  // Restore saved options from chrome.storage
  document.addEventListener('DOMContentLoaded', ()=>{

    chrome.storage.sync.get(
      { mantainExtended: true, shiftWebpage: true }, // Default values if there are no saved ones
      (items) => {
        document.getElementById('mantainExtended').checked = items.mantainExtended;
        document.getElementById('shiftWebpage').checked = items.shiftWebpage;
      }
    );

  });

} catch(error) { console.error(" @Options ERROR => " + error); }