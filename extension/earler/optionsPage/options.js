
try{
  // Save selected options into chrome.storage
  document.getElementById('saveOptions').addEventListener('click', ()=>{

    const mantainExtended = document.getElementById('mantainExtended').checked;
    const shiftWebpage = document.getElementById('shiftWebpage').checked;
    const enableBlacklist = document.getElementById('enableBlacklist').checked;

    chrome.storage.sync.set(
      { mantainExtended, shiftWebpage, enableBlacklist },
      () => {
        chrome.storage.sync.set({ "blackListUpdated": true });
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

  document.getElementById('emptyList').addEventListener('click', () => {
    chrome.storage.sync.remove("blacklist");
    chrome.storage.sync.set(
      { "blackListUpdated": true }, () => { window.location.reload(); }
    );
  });
  
  chrome.storage.sync.get(
    { mantainExtended: false, shiftWebpage: false, enableBlacklist: false, blacklist: null }, // Default values if there are no saved ones
    (items) => {
      document.getElementById('mantainExtended').checked = items.mantainExtended;
      document.getElementById('shiftWebpage').checked = items.shiftWebpage;
      document.getElementById('enableBlacklist').checked = items.enableBlacklist;
      
      const blacklist = document.getElementById('blacklist');
      while (blacklist.firstChild) {
        blacklist.removeChild(blacklist.firstChild);
      }

      if(!items.blacklist || items.blacklist.length === 0){
        const tr = document.createElement("tr");
        tr.style.textAlign = "center";
        const td = document.createElement("td");
        td.colSpan = 5;
        td.textContent = "No blacklisted elements";
        tr.appendChild(td)
        blacklist.appendChild(tr);
      }else{
        const list = items.blacklist;
        const deleteImgSrc = chrome.runtime.getURL('/images/delete.png');
        for(let i = 0; i<list.length; i++){
          const listedItem = list[i];
          const tr = document.createElement("tr");
          tr.style.textAlign = "center";

          const evaluator = document.createElement("td");
          const criteria = document.createElement("td");
          const outcome = document.createElement("td");
          const message = document.createElement("td");
          const img = document.createElement("td");
          const removeImg = document.createElement("img");

          evaluator.textContent = listedItem.evaluator;
          criteria.textContent = listedItem.criteria;
          outcome.textContent = listedItem.outcome;
          message.textContent = listedItem.message;
          removeImg.src = deleteImgSrc;
          img.appendChild(removeImg);

          removeImg.addEventListener("click", () => {
            const newBlacklist = list.filter(element => element !== listedItem);
            chrome.storage.sync.set(
                { "blacklist": newBlacklist, "blackListUpdated": true }, async () => { 
                  window.location.reload();
                }
            );
          });

          tr.appendChild(evaluator);
          tr.appendChild(criteria);
          tr.appendChild(outcome);
          tr.appendChild(message);
          tr.appendChild(img);
          blacklist.appendChild(tr);
        }
      }
      
    }
  );

} catch(error) { console.error(" @Options ERROR => " + error); }