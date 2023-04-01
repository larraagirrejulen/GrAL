import React from 'react';
import ReactDOM from 'react-dom/client';
import Extension from './Extension';

const rootElement = document.createElement("div");
rootElement.id = "ac-check-extension";

const siteList = ["https://www.w3.org", "https://accessmonitor.acessibilidade.gov.pt", "https://achecker.achecks.ca", "https://github.com", "https://mauve.isti.cnr.it"];

if (!siteList.includes(String(window.location.origin))){

  document.body.appendChild(rootElement);
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <Extension />
    </React.StrictMode>
  );
  
}
