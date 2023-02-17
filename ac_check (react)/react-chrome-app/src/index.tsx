import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.createElement("div");
rootElement.id = "react-chrome-extension";
rootElement.className = "react-chrome-extension"

var origin = window.location.origin;
      
if(String(origin) !=="https://www.w3.org" && String(origin) !=="https://accessmonitor.acessibilidade.gov.pt" && String(origin) !=="https://achecker.achecks.ca" && String(origin) !=="https://github.com"){
  document.body.appendChild(rootElement);
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );  
}
