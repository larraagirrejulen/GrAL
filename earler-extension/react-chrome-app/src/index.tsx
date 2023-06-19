
import React from 'react';
import ReactDOM from 'react-dom/client';
import Extension from './components/Extension';

/**
 * Root element for the extension.
 * @type {HTMLDivElement}
 */
const rootElement = document.createElement("div");
rootElement.id = "ac-check-extension";

/**
 * List of websites where the extension will not be loaded.
 * @type {string[]}
 */
const exceptionsList = [
  "https://www.w3.org", 
  "https://accessmonitor.acessibilidade.gov.pt", 
  "https://achecker.achecks.ca", 
  "https://github.com", 
  "https://mauve.isti.cnr.it", 
  "https://www.google.com"
];

// Check if the current URL is not in the exceptions list
if (!exceptionsList.includes(String(window.location.origin))){

  // Append the root element to the document body
  document.body.appendChild(rootElement);

  // Create a React root and render the Extension component
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Extension />
    </React.StrictMode>
  );
  
}
