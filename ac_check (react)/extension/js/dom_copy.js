
// Create a copy of the original document
const originalDocument = document.implementation.createHTMLDocument();
originalDocument.documentElement.innerHTML = document.documentElement.innerHTML;

// Serialize the new document to a string
const originalDocumentString = new XMLSerializer().serializeToString(originalDocument);

// Store the string in localStorage with a key of your choice
localStorage.setItem('originalDocument', originalDocumentString);



// Get the original document wihtout extension changes and current runtime state
function getOriginalDocWithCurrentState(){

    // Get the screen size
    const currentScreenSize = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    // Get the ARIA attributes for relevant elements
    const ariaAttrs = {};
    const ariaEls = document.querySelectorAll('[role]');
    ariaEls.forEach(el => {
        const attrs = {};
        for (let i = 0; i < el.attributes.length; i++) {
            const attr = el.attributes[i];
            if (attr.name.startsWith('aria-')) {
                attrs[attr.name] = attr.value;
            }
        }
        if (Object.keys(attrs).length > 0) {
            ariaAttrs[el.id] = attrs;
        }
    });

    // Retrieve the stored string from localStorage
    const storedOriginalDocString = localStorage.getItem('originalDocument');

    // Parse the string back into a new document object
    const originalDoc = document.implementation.createHTMLDocument();
    originalDoc.documentElement.innerHTML = storedOriginalDocString;

    // Apply saved screen size to the restored document
    originalDoc.documentElement.style.width = currentScreenSize.width + 'px';
    originalDoc.documentElement.style.height = currentScreenSize.height + 'px';

    // Apply any saved ARIA attributes to relevant elements in the restored document
    Object.entries(ariaAttrs).forEach(([elId, attrs]) => {
        const el = originalDoc.getElementById(elId);
        if (el) {
            Object.entries(attrs).forEach(([attrName, attrValue]) => {
                el.setAttribute(attrName, attrValue);
            });
        }
    });

    console.log(originalDoc.documentElement.style.width);
    console.log(currentScreenSize.width);

    // Return the restored document copy object
    return originalDoc;
}