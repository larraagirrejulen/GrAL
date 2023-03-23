const http = require('http');
const scraperController = require('./scrapingController');

const puerto = 7070;
console.log("listening on: 0.0.0.0:" + puerto);

http.createServer((request, response) => {

    request.on('error', (err) => {
        console.error(err);
        response.statusCode = 400;
        response.end();
    });
    response.on('error', (err) => {
        console.error(err);
    });

    const { headers, method, url } = request;
    if (method !== 'POST' || url !== '/getEvaluationJson') {
        response.statusCode = 404;
        response.end();
    }

    let requestBody = [];

    request.on('data', (chunk) => {
        requestBody.push(chunk);
    }).on('end', async () => {
        
        requestBody = Buffer.concat(requestBody).toString();

        console.log("\n### ----- New Scraping Request ----- ###\n" + "\nRequest: " + requestBody);

        try{
            const requestJson = JSON.parse(requestBody);
    
            const body = await scraperController(requestJson["mv"], requestJson["am"], requestJson["ac"], requestJson["url"], requestJson["title"]);

            response.writeHead(200, {'Content-Type': 'application/json'});

            response.end(JSON.stringify( { headers, method, url, body } ));

            console.log("### ----- Request SUCCESS  ----- ###");

        } catch(error) { 
            response.statusCode = 500;
            response.end();
            console.log("\n ERROR: " + error + "\n\n### ----- Request FAILURE  ----- ###");
        }
        
    });
}).listen(puerto);

