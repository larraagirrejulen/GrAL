
// Create a copy of the original document
var originalDoc = document.implementation.createHTMLDocument();
originalDoc.documentElement.innerHTML = document.documentElement.innerHTML;

// var originalDoc = document.cloneNode(true);



// Get the original document wihtout extension changes and current runtime state
function getOriginalDocWithCurrentState(){

    console.log(originalDoc.body);
    console.log(document.body);
    console.log(document.body == originalDoc.body);

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

    // Apply any saved ARIA attributes to relevant elements in the restored document
    Object.entries(ariaAttrs).forEach(([elId, attrs]) => {
        const el = originalDoc.getElementById(elId);
        if (el) {
            Object.entries(attrs).forEach(([attrName, attrValue]) => {
                el.setAttribute(attrName, attrValue);
            });
        }
    });

    // Return the restored document copy object
    return originalDoc;
}
