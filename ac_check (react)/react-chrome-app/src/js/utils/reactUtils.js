
import { getFromChromeStorage } from './chromeUtils.js';



/**
 * Sets the value of a React state hook from Chrome storage.
 *
 * @param {string} key - The name of the storage key to retrieve the value from.
 * @param {boolean} isSync - Whether to use synchronous or asynchronous storage APIs.
 * @param {function} setState - The React `setState` function to update the state with the retrieved value.
 * @param {string} errorMessage - The error message to throw if the value is not found in storage.
 * @returns {void}
 * @throws {Error} - Throws an error with the given error message if the value is not found in storage.
 */
export async function setUseStateFromStorage(key, isSync, setState, errorMessage){
    
    const storedValue = await getFromChromeStorage(key, isSync);

    if(storedValue != null){
        setState(storedValue);
    }else{
        throw Error("chromeUtils.js setUseStateFromStorage Error => " + errorMessage);
    }
}



