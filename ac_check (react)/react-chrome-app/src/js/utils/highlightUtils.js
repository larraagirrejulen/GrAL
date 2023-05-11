

export function highlightElement(element, groupKey, index){

    const highlightDiv = document.createElement("div");
    highlightDiv.id = "acCheckHighlighter_" + groupKey + "_" + index;
    highlightDiv.classList.add("acCheckHighlighter");
    highlightDiv.style.border = "3px solid #00FFF7";
    
    const parent = element.parentElement;
    parent.replaceChild(highlightDiv, element);
    highlightDiv.appendChild(element);

}


export function selectHighlightedElement(groupKey, index){

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

    //sendMessageToBackground("createElementPopup", resultGroupedPointers[groupKey][index].path);

}




export function removeElementHighlights(){

    const highlighters = document.querySelectorAll(".acCheckHighlighter");

    for(const highlighter of highlighters){

        const parent = highlighter.parentElement;
        const child = highlighter.children[0];

        parent.replaceChild(child, highlighter);

    }

}