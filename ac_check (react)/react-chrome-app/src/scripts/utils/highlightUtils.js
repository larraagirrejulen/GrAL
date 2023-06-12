

export function highlightElement(element, groupKey, index){

    var wrapper = document.createElement('div');
    wrapper.id = "acCheckHighlighter_" + groupKey + "_" + index;
    wrapper.className = "highlighted-wrapper";
    wrapper.style.border = '3px solid aqua'; // Change the color and size as desired
    wrapper.style.display = 'inline-block';
    wrapper.style.padding = '3px'; // Optional: Add padding to create some space around the highlighted element
    wrapper.style.cursor = "pointer";
    wrapper.style.borderRadius = "6px";
    wrapper.style.verticalAlign = "middle";
    wrapper.style.display = "inline-block";
    wrapper.style.position = "relative";
    wrapper.style.textAlign = "center";

    element.replaceWith(wrapper);
    wrapper.appendChild(element);

}

function onMouseOver(popup){
    popup.style.visibility = "visible";
}

export function selectHighlightedElement(groupKey, index, documentation){

    const wrapper = document.querySelector("#acCheckHighlighter_" + groupKey + "_" + index);
    wrapper.style.border = "3px solid #FF3633";
    wrapper.classList.add("selected");
    wrapper.setAttribute("tabindex", "0");
    wrapper.focus();
    wrapper.blur();

    const highlightAnimation = (repeat) => {
        setTimeout(() => {
            wrapper.style.border = "3px solid white";
            setTimeout(() => {
                wrapper.style.border = "3px solid #FF3633";
                if(repeat > 0) highlightAnimation (repeat - 1);
            }, 120);
        }, 120);
    }

    highlightAnimation(1);

    const popup = createPopup(documentation);

    wrapper.appendChild(popup);
    wrapper.addEventListener('mouseover', () => onMouseOver(popup));

}






export function unselectHighlightedElement(){

    const previousSelected = document.querySelector(".highlighted-wrapper.selected");

    if(previousSelected){

        const popup = document.querySelector(".highlighted-wrapper.selected .highlightPopup");

        if(popup) popup.remove();

        previousSelected.removeEventListener('mouseover', () => onMouseOver(popup));

        previousSelected.classList.remove("selected");
        previousSelected.style.border = "3px solid #00FFF7";

    }

}




export function removeElementHighlights(){

    const wrappers = document.querySelectorAll(".highlighted-wrapper");

    for(const wrapper of wrappers){

        var element = wrapper.firstChild;
        wrapper.parentNode.replaceChild(element, wrapper);

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
    popup.style.visibility = "hidden";
    popup.style.display = "block";
    popup.style.position = "absolute";
    popup.style.bottom = "-84px";

    return popup;
}