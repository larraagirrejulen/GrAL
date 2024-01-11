
import React from 'react';
import ReactDOM from 'react-dom/client';
import EarlerExtension from './components/EarlerExtension';

const rootElement = document.createElement("div");
rootElement.id = "earlerExtension";

// Append the root element to the document body
document.body.appendChild(rootElement);

// Create a React root and render the Extension component
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <EarlerExtension/>
  </React.StrictMode>
);
