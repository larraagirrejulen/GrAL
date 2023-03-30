import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.createElement("div");
rootElement.id = "ac-check-extension";

const siteList = ["https://www.w3.org", "https://accessmonitor.acessibilidade.gov.pt", "https://achecker.achecks.ca", "https://github.com", "https://mauve.isti.cnr.it"];

const origin = window.location.origin;

if (!siteList.includes(String(origin))){

  document.body.appendChild(rootElement);
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
