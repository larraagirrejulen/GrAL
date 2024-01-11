
import { Evaluator } from "../../types/customTypes";


/**
 * Highlights an HTML element by wrapping it with a styled wrapper.
 *
 * @param {HTMLElement} element - The element to highlight.
 * @param {Evaluator} evaluator - The evaluator corresponding to the highlighter.
 * @param {number} index - The index of the highlight corresponding to the evaluator.
 */
export function highlightElement(element: HTMLElement, evaluator: Evaluator, index: number){

    const wrapper = document.createElement('div');
    wrapper.id = `acCheckHighlighter_${evaluator}_${index}`;
    wrapper.className = 'highlighted-wrapper';

    Object.assign(wrapper.style, {
      border: '3px solid aqua',
      display: 'inline-block',
      padding: '3px',
      cursor: 'pointer',
      borderRadius: '6px',
      verticalAlign: 'middle',
      position: 'relative',
      textAlign: 'center',
    });
  
    element.replaceWith(wrapper);
    wrapper.appendChild(element);

}

/**
 * Event handler for mouseover event on the popup element.
 *
 * @param {HTMLDivElement} popup - The popup element.
 */
function onMouseOver(popup: HTMLDivElement){
    popup.style.visibility = "visible";
}

/**
 * Selects a highlighted element and adds additional styling.
 *
 * @param {Evaluator} evaluator - The evaluator of the highlighted element.
 * @param {number} index - The index for the highlighted element.
 * @param {string} documentation - The documentation URL.
 */
export function selectHighlightedElement(evaluator: Evaluator, index: number, documentation: string){

    const wrapper = document.querySelector(`#acCheckHighlighter_${evaluator}_${index}`) as HTMLDivElement;
    
    wrapper.style.borderColor = "#FF3633";
    wrapper.classList.add("selected");
    wrapper.setAttribute("tabindex", "0");
    wrapper.focus();
    wrapper.blur();

    const highlightAnimation = (repeat: number) => {
        setTimeout(() => {
            wrapper.style.borderColor = "white";
            setTimeout(() => {
                wrapper.style.borderColor = "#FF3633";
                if(repeat > 0) highlightAnimation(repeat - 1);
            }, 120);
        }, 120);
    }

    highlightAnimation(1);

    const popup = createPopup(documentation);

    wrapper.appendChild(popup);
    wrapper.addEventListener('mouseover', () => onMouseOver(popup));
    
}





/**
 * Unselects a highlighted element and removes additional styling.
 */
export function unselectHighlightedElement(){

    const previousSelected = document.querySelector(".highlighted-wrapper.selected") as HTMLDivElement;

    if(previousSelected){

        const popup = document.querySelector(".highlighted-wrapper.selected .highlightPopup") as HTMLDivElement;

        if(popup){
            previousSelected.removeEventListener('mouseover', () => onMouseOver(popup));
            popup.remove();
        } 
        
        previousSelected.classList.remove("selected");
        previousSelected.style.borderColor = "#FF3633";

    }

}



/**
 * Removes the highlights from all highlighted elements.
 */
export function removeElementHighlights(){

    const wrappers = document.querySelectorAll(".highlighted-wrapper") as NodeListOf<HTMLDivElement>;

    wrappers.forEach(function (wrapper) {
        var element = wrapper.firstChild;
        if(element){
            wrapper.parentNode?.replaceChild(element, wrapper);
        }
    });

}




/**
 * Creates a popup element with relevant information.
 *
 * @param {string} documentation - The documentation URL.
 * @returns {HTMLDivElement} The created popup element.
 */
function createPopup(documentation: string){

    const popup = document.createElement("div");

    const solve = document.createElement("span");
    solve.textContent = "How to solve?";
    popup.appendChild(solve);
    
    popup.appendChild(document.createElement("br"));

    const docLink = document.createElement("u");
    docLink.classList.add("documentationLink");
    docLink.textContent = "Documentation";
    popup.appendChild(docLink);

    docLink.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent event propagation to underlying elements
        window.open(documentation, '_blank');
    });

    popup.appendChild(document.createElement("br"));

    const closeLink = document.createElement("u");
    closeLink.classList.add("closeLink");
    closeLink.textContent = "Close";
    popup.appendChild(closeLink);

    closeLink.addEventListener('click', (event) => {
        popup.remove();
        event.stopPropagation(); // Prevent event propagation to underlying elements
    });

    popup.classList.add("highlightPopup");

    Object.assign(popup.style, {
        visibility: "hidden",
        display: "block",
        position: "absolute",
        bottom: "-84px"
    });

    return popup;
}