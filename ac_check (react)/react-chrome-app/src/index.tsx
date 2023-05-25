
/**
 * Renders the "ac-check-extension" React component on the page, if the current page URL is not in the "exceptionsList".
 * @module AC-Check-Extension
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import Extension from './components/Extension';

/**
 * The root element to render the "ac-check-extension" component into.
 * @constant {HTMLDivElement}
 */
const rootElement = document.createElement("div");
rootElement.id = "ac-check-extension";

/**
 * List of URLs for which the extension will not be rendered.
 * @constant {string[]}
 */
const exceptionsList = ["https://www.w3.org", "https://accessmonitor.acessibilidade.gov.pt", "https://achecker.achecks.ca", "https://github.com", "https://mauve.isti.cnr.it", "https://www.google.com"];

if (!exceptionsList.includes(String(window.location.origin))){

  document.body.appendChild(rootElement);

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Extension />
    </React.StrictMode>
  );
  
}
