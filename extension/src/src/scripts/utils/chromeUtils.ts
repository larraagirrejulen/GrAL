/* eslint-disable no-undef */
import { mapReportData } from '../mapReportData';
import { BlackList, BlackListedElement, ChromeStorageKey, ImageName } from '../../types/customTypes';


/**
 * Retrieves the image source URL for a given image name.
 *
 * @param {ImageName} imgName - The name of the image.
 * @returns {string} The image source URL.
 */
export function getImgSrc(imgName: ImageName){
    return chrome.runtime.getURL(`/images/${imgName}.png`);
}


/**
 * Retrieves a value from Chrome storage.
 * @param {ChromeStorageKey} chromeStorageKey - The key to retrieve the value for.
 * @param {boolean} [sync=false] - Indicates whether to use the sync storage or local storage. Default is local storage.
 * @returns {Promise<any>} A promise that resolves with the retrieved value.
 */
export function getFromChromeStorage(chromeStorageKey: ChromeStorageKey, sync = false): Promise<any> {
    return new Promise((resolve) => {
        chrome.storage[sync ? 'sync' : 'local'].get(chromeStorageKey, (result) => {
            resolve(result[chromeStorageKey]);
        });
    });
}


/**
 * Stores a value in Chrome storage.
 * @param {ChromeStorageKey} chromeStorageKey - The key to store the value under.
 * @param {any} value - The value to store.
 * @param {boolean} [sync=false] - Indicates whether to use the sync storage or local storage. Default is local storage.
 */
export function storeOnChromeStorage(chromeStorageKey: ChromeStorageKey, value: any, sync = false){
    let obj = {[chromeStorageKey]: value};
    chrome.storage[sync ? "sync" : "local"].set(obj);
}


/**
 * Removes a value from Chrome storage.
 * @param {ChromeStorageKey} chromeStorageKey - The key to remove from storage.
 * @param {boolean} [sync=false] - Indicates whether to remove the value from sync storage or local storage. Default is local storage.
 */
export function removeFromChromeStorage(chromeStorageKey: ChromeStorageKey, sync = false) {
    chrome.storage[sync ? "sync" : "local"].remove(chromeStorageKey);
}


/**
 * Appends an element to the blacklist and updates the storage.
 * @param {BlackListedElement} newListElement - The element to append on the blacklist.
 * @returns {Promise<void>} A promise that resolves when the blacklist is updated.
 */
export async function appendBlackListElement(newListElement: BlackListedElement) {

    if(!window.confirm("Append the selected evaluator message into the black list?")){
        return;
    } 

    const blacklist: BlackList = await getFromChromeStorage("blackList", true);
    blacklist.push(newListElement);

    chrome.storage.sync.set({ blacklist }, async () => { 
        mapReportData(undefined, blacklist); 
    });

}