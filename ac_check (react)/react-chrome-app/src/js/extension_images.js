
export function getLogoImage(){
    console.log("a");
    // eslint-disable-next-line no-undef
    return chrome.runtime.getURL('/images/icon128.png');
}

export function getArrowSrc (){
    console.log("b");
    // eslint-disable-next-line no-undef
    return chrome.runtime.getURL('/images/arrow.png');
}

export function getArrowUpSrc (){
    console.log("c");
    // eslint-disable-next-line no-undef
    return chrome.runtime.getURL('/images/arrow_up.png');
}
