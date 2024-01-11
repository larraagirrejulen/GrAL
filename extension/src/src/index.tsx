
import React from 'react';
import ReactDOM from 'react-dom/client';
import Extension from './components/Extension';

const ignoredSites = [
  "www.w3.org", 
  "accessmonitor.acessibilidade.gov.pt", 
  "achecker.achecks.ca", 
  "github.com", 
  "mauve.isti.cnr.it"
];

// Check if the current URL is not in the ignoredSites list
if (!ignoredSites.includes(`https://${String(window.location.origin)}`)){

  const rootElement = document.createElement("div");
  rootElement.id = "earlerExtension";

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
