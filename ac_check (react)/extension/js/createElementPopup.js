

chrome.storage.local.get(["path"], ({ path }) => {

    try{

        const lastPopup = document.querySelector("#highlightPopup");

        if(lastPopup){
            lastPopup.remove();
        } 

        let element;

        if(path.startsWith("Line")){
            return;
        }else if(path.startsWith("/")){
            element = document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        }else{
            element = document.querySelector(path);
        }

        const parent = element.parentNode;

        const popup = document.createElement("div");
        popup.setAttribute("id", "highlightPopup");
        popup.classList.add("highlightPopup");
        popup.innerHTML = '<span>How to solve?</span></br><u class="documentationLink">Documentation</u></br><u class="closeLink">Close</u><script src="popup.js"> </script>';
        popup.style.position = "absolute";
        popup.style.opacity = "0";



        const elementRect = element.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();

        console.log(elementRect.top, elementRect.bottom);

        const left = elementRect.left - parentRect.left;
        const top = elementRect.bottom - parentRect.top;

        
        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;



        parent.appendChild(popup);
        
        parent.addEventListener('mouseover', ()=>{
            popup.style.opacity = "1";
        });

        parent.addEventListener('mouseout', ()=>{
            popup.style.opacity = "0";
        });

        document.querySelector('#highlightPopup .closeLink').addEventListener('click', ()=>{
            document.getElementById("highlightPopup").remove();
        });
        
        document.querySelector('#highlightPopup .documentationLink').addEventListener('click', ()=>{
            window.open("https://github.com/larraagirrejulen/GrAL", '_blank');
        });

        

    } catch(error) {
        throw new Error("@createElementPopup.js: error creating the popup => " + error);
    }

});



