/* eslint-disable no-undef */

export function getLogoSrc(){
    return chrome.runtime.getURL('/images/icon128.png');
}

export function getArrowSrc (){
    return chrome.runtime.getURL('/images/contractedArrow.png');
}

export function getArrowUpSrc (){
    return chrome.runtime.getURL('/images/extendedArrow.png');
}

export function getConfigImgSrc(){
    return chrome.runtime.getURL('/images/settingsGear.png');
}


export function openOptionsPage(){
    chrome.runtime.sendMessage({ action: "openOptionsPage" });
}

export async function getOptions(option, setOptionValue){
    if(option === "mantainExtended"){
        chrome.storage.sync.get(["mantainExtended"], (result) => {
            setOptionValue(result.mantainExtended);
        });
    } else if(option === "shiftWebpage"){
        const result = await new Promise((resolve) => { 
            chrome.storage.sync.get(["shiftWebpage"], (result) => {
                resolve(result.shiftWebpage);
            });
        });
        return result;
    }
}

export async function storeOnChrome(key, value){
    let obj = {};
    obj[key] = value;
    chrome.storage.local.set(obj);
}

export async function getFromChromeStorage(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {
            resolve(result[key]);
        });
    });
}

export async function removeFromChromeStorage(key) {
    chrome.storage.local.remove(key);
}