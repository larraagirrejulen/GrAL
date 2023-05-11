const http = require('http');
const scraperController = require('./scraping/scrapingController');


/**
 * HTTP server instance to handle incoming requests.
 * @type {http.Server}
 */
const server = http.createServer(async (request, response) => {

    // Handle errors that occur during the request.
    request.on('error', (err) => {
        console.error(err);
        response.writeHead(400).end();
    });

    const { method, url } = request;

    // Return a 404 response if the request method or URL is not supported.
    if (method !== 'POST' || url !== '/getEvaluationJson') response.writeHead(404).end();

    let requestBody = [];
    
    request.on(
        'data', (chunk) => requestBody.push(chunk)
    ).on(
        'end', async () => {

            try{

                // Get the requests evaluation parameters.
                requestBody = Buffer.concat(requestBody).toString();
                requestBody = JSON.parse(requestBody);
                console.log("\n### ----- New Scraping Request ----- ###");

                // Process the request using the scraperController.
                const body = await scraperController(requestBody);

                // Send a successful response and the evaluation report back to the client.
                response.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify(body));
                console.log("\n### ----- Request SUCCESS  ----- ###");

            } catch(error) { 

                // Send a 500 error response if an error occurred during processing.
                response.writeHead(500).end();
                console.log("\n ERROR: \n" + error + "\n\n### ----- Request FAILURE  ----- ###");
                
            }
        }
    );
    
});


// Start the server listening on the specified port.
const PORT = 7070;
server.listen(PORT);
console.log("listening on: 0.0.0.0:" + PORT);

