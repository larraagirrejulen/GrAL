
import { getFromChromeStorage } from './chromeUtils.js';
import { removeElementHighlights } from './highlightUtils.js';



/**
 * Sets the value of a React state hook from Chrome storage.
 *
 * @param {string} key - The name of the storage key to retrieve the value from.
 * @param {boolean} isSync - Whether to use synchronous or asynchronous storage APIs.
 * @param {function} setState - The React `setState` function to update the state with the retrieved value.
 * @returns {void}
 * @throws {Error} - Throws an error with the given error message if the value is not found in storage.
 */
export async function setUseStateFromStorage(key, isSync, setState){
    
    const storedValue = await getFromChromeStorage(key, isSync);
    if(storedValue != null){
        setState(storedValue);
    }

}




/**
 * Returns an HTML element that matches the given xpath or selector, and optionally contains the given inner text.
 * @function getElementByPath
 * @param {string} path - The xpath or CSS selector to search for the element.
 * @param {string} [innerText] - The inner text to search for within the elements.
 * @returns {HtmlElement|null} - The first matching element, or null if no elements are found.
 */
export function getElementByPath(path, innerText) {
    
    if (!path) throw new Error("Invalid input: path is null or undefined.");

    let element = null;

    if (path.startsWith("/")) {
        // Use an XPath expression to find the element
        element = document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    } else {
        // Use a CSS selector to find the elements
        const elements = document.querySelectorAll(path);

        if (elements.length > 0) {
            
            element = elements[0];

            for (let i = 0; i < elements.length; i++) {
                if (innerText && elements[i].textContent === innerText) {
                    element = elements[i];
                    break;
                }
            }
        }
    }

    return element;
}




/**
 * Handles changes to a boolean state value in an array of state values.
 *
 * @param {Array<boolean>} useState - The current array of boolean state values.
 * @param {function} setUseState - The React `useState` hook function to update the state with the new array of boolean values.
 * @param {number} index - The index of the state value to change.
 * @param {boolean} mantainExtended - Whether to maintain the other values of the array.
 * @param {number} arrayLength - The length of the array to fill when adding a new state value.
 * @returns {void}
 */
export function collapsibleClickHandler(useState, setUseState, index, mantainExtended, arrayLength){

    const newStates = mantainExtended ? [...useState] : Array(arrayLength).fill(false);
    newStates[index] = !useState[index];
    setUseState(newStates);

}
