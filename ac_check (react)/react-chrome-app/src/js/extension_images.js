
export function loadLogoImage(setLogoImgSrc){
    console.log("a");
    setLogoImgSrc(chrome.runtime.getURL('/images/icon128.png'));
}

export function getArrowSrc (){
    console.log("b");
    return chrome.runtime.getURL('/images/arrow.png');
}

export function getArrowUpSrc (){
    console.log("c");
    return chrome.runtime.getURL('/images/arrow_up.png');
}
