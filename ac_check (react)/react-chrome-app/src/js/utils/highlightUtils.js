

export function highlightElement(element, groupKey, index){

    const highlightDiv = document.createElement("div");
    highlightDiv.id = "acCheckHighlighter_" + groupKey + "_" + index;
    highlightDiv.classList.add("acCheckHighlighter");
    highlightDiv.style.border = "3px solid #00FFF7";
    highlightDiv.style.cursor = "pointer";
    
    const parent = element.parentElement;
    parent.replaceChild(highlightDiv, element);
    highlightDiv.appendChild(element);

}

function onMouseOver(popup){
    popup.style.visibility = "visible";
}

export function selectHighlightedElement(groupKey, index, documentation){

    const highlightElement = document.querySelector("#acCheckHighlighter_" + groupKey + "_" + index);
    highlightElement.style.border = "3px solid #FF3633";
    highlightElement.classList.add("selected");
    highlightElement.setAttribute("tabindex", "0");
    highlightElement.focus();
    highlightElement.blur();

    const highlightAnimation = (repeat) => {
        setTimeout(() => {
            highlightElement.style.border = "3px solid white";
            setTimeout(() => {
                highlightElement.style.border = "3px solid #FF3633";
                if(repeat > 0) highlightAnimation (repeat - 1);
            }, 120);
        }, 120);
    }

    highlightAnimation(1);

    const popup = createPopup(documentation);

    highlightElement.appendChild(popup);
    highlightElement.addEventListener('mouseover', () => onMouseOver(popup));

}






export function unselectHighlightedElement(){

    const previousSelected = document.querySelector(".acCheckHighlighter.selected");

    if(previousSelected){

        const popup = document.querySelector(".acCheckHighlighter.selected .highlightPopup");

        if(popup) popup.remove();

        previousSelected.removeEventListener('mouseover', () => onMouseOver(popup));

        previousSelected.classList.remove("selected");
        previousSelected.style.border = "3px solid #00FFF7";

    }

}




export function removeElementHighlights(){

    const highlighters = document.querySelectorAll(".acCheckHighlighter");

    for(const highlighter of highlighters){

        const parent = highlighter.parentElement;
        const child = highlighter.children[0];

        parent.replaceChild(child, highlighter);

    }

}





function createPopup(documentation){

    const popup = document.createElement("div");

    const solve = document.createElement("span");
    solve.textContent = "How to solve?";
    popup.appendChild(solve);
    
    popup.appendChild(document.createElement("br"));

    const docLink = document.createElement("u");
    docLink.classList.add("documentationLink");
    docLink.textContent = "Documentation";
    popup.appendChild(docLink);

    docLink.addEventListener('click', () => {
        window.open(documentation, '_blank');
    });

    popup.appendChild(document.createElement("br"));

    const closeLink = document.createElement("u");
    closeLink.classList.add("closeLink");
    closeLink.textContent = "Close";
    popup.appendChild(closeLink);

    closeLink.addEventListener('click', () => {
        popup.remove();
    });

    popup.classList.add("highlightPopup");
    popup.style.visibility = "hidden";

    return popup;
}