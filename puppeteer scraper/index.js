const http = require('http');
const scraperController = require('./scrapingController');

const PORT = 7070;
console.log("listening on: 0.0.0.0:" + PORT);

http.createServer((request, response) => {

    request.on('error', (err) => {
        console.error(err);
        response.statusCode = 400;
        response.end();
    });

    const { headers, method, url } = request;
    if (method !== 'POST' || url !== '/getEvaluationJson') {
        response.statusCode = 404;
        response.end();
    }

    let requestBody = [];

    request.on('data', (chunk) => requestBody.push(chunk)
    ).on('end', async () => {
        
        requestBody = Buffer.concat(requestBody).toString();
        console.log("\n### ----- New Scraping Request ----- ###");

        try{

            const requestJson = JSON.parse(requestBody);
            const body = await scraperController(requestJson["am"], requestJson["ac"], requestJson["mv"], requestJson["pa"], requestJson["url"], requestJson["title"]);
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify( { headers, method, url, body } ));
            console.log("\n### ----- Request SUCCESS  ----- ###");

        } catch(error) { 

            response.statusCode = 500;
            response.end();
            console.log("\n ERROR: " + error + "\n\n### ----- Request FAILURE  ----- ###");
        
        }
    });
    
}).listen(PORT);

