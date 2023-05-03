/* eslint-disable no-undef */


/**
 * Returns the URL of an image from the 'images' folder.
 * @function getImgSrc
 * @param {string} name - The name of the image.
 * @returns {string} - The URL of the image.
 */
export function getImgSrc(name){
    return chrome.runtime.getURL('/images/' + name + '.png');
}


/**
 * Stores a key-value pair in Chrome's local storage.
 * @function storeOnChromeStorage
 * @param {string} key - The key to store the value under.
 * @param {*} value - The value to store.
 * @returns {void}
 */
export function storeOnChromeStorage(key, value){
    let obj = {};
    obj[key] = value;
    chrome.storage.local.set(obj);
}


/**
 * Removes a value from Chrome's local storage.
 * @function removeFromChromeStorage
 * @param {string} key - The key to remove the value of.
 * @returns {void}
 */
export function removeFromChromeStorage(key) {
    chrome.storage.local.remove(key);
}


/**
 * Retrieves a value from Chrome's storage.
 * @async
 * @function getFromChromeStorage
 * @param {string} key - The key to retrieve the value of.
 * @param {boolean} [isSync=true] - Whether to retrieve the value from Chrome's 'sync' storage or 'local' storage.
 * @returns {Promise<*>} - A Promise that resolves with the retrieved value.
 */
export async function getFromChromeStorage(key, isSync = true) {
    return await new Promise((resolve) => {
        chrome.storage[isSync ? 'sync' : 'local'].get(key, (result) => {
            resolve(result[key]);
        });
    });
}


/**
 * Sends a message to the background script of a Chrome extension.
 * @async
 * @function sendMessageToBackground
 * @param {string} action - The action to perform.
 * @param {string|null} [path=null] - The path to perform the action on.
 * @returns {Promise<*>} - A Promise that resolves with the response from the background script.
 */
export async function sendMessageToBackground( action, path = null ){
    return await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: action, path: path}, response => {
            chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve(response);
        });
    });
}