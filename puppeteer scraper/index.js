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
    if (!method === 'POST' || !url === '/getEvaluationJson') {
        response.statusCode = 404;
        response.end();
    }

    let requestBody = [];

    request.on('data', (chunk) => {
        requestBody.push(chunk);
    }).on('end', async () => {
        
        requestBody = Buffer.concat(requestBody).toString();
        const requestJson = JSON.parse(requestBody);
        console.log("Request: " + requestBody);
    
        var body = await scraperController(requestJson["mv"], requestJson["am"], requestJson["ac"], requestJson["url"]);

        response.writeHead(200, {'Content-Type': 'application/json'});
        const responseBody = { headers, method, url, body };
        response.end(JSON.stringify(responseBody));
        console.log("Fetch Success");
    });
}).listen(puerto);

