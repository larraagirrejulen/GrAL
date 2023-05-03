

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
 * Removes any existing highlight popup and restores the default styles of previously highlighted elements.
 */
export function clearHighlights(){

    const lastPopup = document.querySelector("#highlightPopup");

    if(lastPopup){
        lastPopup.remove();
    } 

    const pointerDefaultStyles = sessionStorage.getItem("defaultStyles");

    if(pointerDefaultStyles){

        const styles = JSON.parse(pointerDefaultStyles);

        for (const groupKey in styles) {
            for(let i = 0; i < styles[groupKey].length; i++){
                
                const pointer = styles[groupKey][i];

                if(!pointer) continue;

                const element = getElementByPath(pointer.path, pointer.innerText);

                if(element){
                    element.removeAttribute("tabindex");
                    element.style.border = pointer.style;
                } 
                
            }
        }
        sessionStorage.removeItem("defaultStyles");
    }
}