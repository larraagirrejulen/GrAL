const http = require('http');
const scraperController = require('./scrapingController');

const server = http.createServer((request, response) => {

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
        console.log(requestJson);
    
        // Pass the browser instance to the scraper controller
        var body = await scraperController(requestJson["mv"], requestJson["am"], requestJson["ac"], requestJson["url"]);

        // Note: the 2 lines above could be replaced with this next one:
        response.writeHead(200, {'Content-Type': 'application/json'});
    
        const responseBody = { headers, method, url, body };
    
        response.end(JSON.stringify(responseBody));

    });
}).listen(7070); // Activates this server, listening on port 7070.

