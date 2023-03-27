/* eslint-disable no-undef */

export function getLogoSrc(){
    return chrome.runtime.getURL('/images/icon128.png');
}

export function getArrowSrc (){
    return chrome.runtime.getURL('/images/arrow.png');
}

export function getArrowUpSrc (){
    return chrome.runtime.getURL('/images/arrow_up.png');
}

export function getConfigImgSrc(){
    return chrome.runtime.getURL('/images/settings_gear.png');
}


export function openOptionsPage(){
    chrome.runtime.sendMessage({ action: "openOptionsPage" });
}