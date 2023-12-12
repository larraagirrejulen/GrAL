# Earler

Earler is a Google Chrome extension that serves to evaluate the accessibility of websites based on the WCAG 2 accessibility standard.

It useses a variety of different tools to perform the evaluations and merge the results in a single report (JSON file) getting 
more accurate results. It also gives tools to manually modifiy the obtained reports and more.

## Getting Started

### Prerequisites

Before starting you must have Node.js installed. Last tested Node.js version v21.4.0.

### Installation

Once you have cloned the repository into a local folder, follow the next steps to be able to use Earler:
1. Go to '/GrAL-Earler/server/', install the dependencies using 'npm install' and run the server using 'npm run start'.
2. Go to 'chrome://extensions/' on Google Chrome, enable the developer mode and load the '/GrAL-Earler/extension/earler/' folder.

If you want to make changes on the extension, first make all the changes on '/GrAL-Earler/extension/src/'
(make sure you also 'npm install' all the dependencies on this folder as well) and later run 'npm run build' 
to build the new version of the extension.
