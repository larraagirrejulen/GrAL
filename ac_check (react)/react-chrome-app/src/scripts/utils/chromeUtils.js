/* eslint-disable no-undef */
import { mapReportData } from '../mapReportData.js';



export function getImgSrc(name){
    return chrome.runtime.getURL('/images/' + name + '.png');
}

export function openOptionsPage(){
    chrome.runtime.sendMessage({action: "openOptionsPage"});
}

export async function getFromChromeStorage(key, isSync = true) {
    return await new Promise((resolve) => {
        chrome.storage[isSync ? 'sync' : 'local'].get(key, (result) => {
            resolve(result[key]);
        });
    });
}

/**
 * Stores a key-value pair in Chrome's local storage.
 * @function storeOnChromeStorage
 * @param {string} key - The key to store the value under.
 * @param {*} value - The value to store.
 * @returns {void}
 */
export function storeOnChromeStorage(key, value, sync = false){
    let obj = {};
    obj[key] = value;
    chrome.storage[sync ? "sync" : "local"].set(obj);
}


/**
 * Removes a value from Chrome's local storage.
 * @function removeFromChromeStorage
 * @param {string} key - The key to remove the value of.
 * @returns {void}
 */
export function removeFromChromeStorage(key, sync = false) {
    chrome.storage[sync ? "sync" : "local"].remove(key);
}






export async function blackListElement(newListElement) {

    if(!window.confirm("Blacklist selected evaluator message?\n(You can remove blacklisted elements from the configuration)")){
        return;
    } 

    const blacklist = await getFromChromeStorage("blacklist") ?? [];
    blacklist.push(newListElement);

    chrome.storage.sync.set({ blacklist }, async () => { 
        mapReportData(null, blacklist); 
    });

}


// Function to set a value in localStorage with a domain-specific prefix
export function setDomainValue(key, value) {
    const prefixedKey = sessionStorage.getItem("currentWebpage") + '.' + key;
    localStorage.setItem(prefixedKey, value);
}
  
// Function to get a value from localStorage with a domain-specific prefix
export function getDomainValue(key) {
    const prefixedKey = sessionStorage.getItem("currentWebpage") + '.' + key;
    return localStorage.getItem(prefixedKey);
}

export function removeDomainValue(key) {
    const prefixedKey = sessionStorage.getItem("currentWebpage") + '.' + key;
    return localStorage.removeItem(prefixedKey);
}