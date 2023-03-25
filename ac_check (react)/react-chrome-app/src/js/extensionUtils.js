
export function getLogoSrc(){
    // eslint-disable-next-line no-undef
    return chrome.runtime.getURL('/images/icon128.png');
}

export function getArrowSrc (){
    // eslint-disable-next-line no-undef
    return chrome.runtime.getURL('/images/arrow.png');
}

export function getArrowUpSrc (){
    // eslint-disable-next-line no-undef
    return chrome.runtime.getURL('/images/arrow_up.png');
}

export function getConfigImgSrc(){
    // eslint-disable-next-line no-undef
    return chrome.runtime.getURL('/images/settings_gear.png');
}


export function openOptionsPage(){
    // eslint-disable-next-line no-undef
    chrome.runtime.sendMessage({ action: "openOptionsPage" });
}