
// Saves options to chrome.storage
const saveOptions = () => {

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
};
  
// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    { mantainExtended: false, shiftWebpage: true },
    (items) => {
      document.getElementById('mantainExtended').checked = items.mantainExtended;
      document.getElementById('shiftWebpage').checked = items.shiftWebpage;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveOptions').addEventListener('click', saveOptions);