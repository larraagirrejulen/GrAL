
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const server = express();
server.use(cors());  // Enable CORS for all routes
server.use(bodyParser.json({ limit: '10mb' })); // Parse JSON request bodies with a higher limit

function routeHandlerWrapper(controllerMethod) {
    return async (request, response) => {
        try {
            const body = await controllerMethod(request.body);
            response.json(body);
            console.log("\n### ----- Request SUCCESS  ----- ###");
        } catch (error) {
            response.sendStatus(500);
            console.log("\n ERROR: \n" + error + "\n\n### ----- Request FAILURE  ----- ###");
        }
    };
}

const evaluation = require('./controllers/scrapingController');
const authentication = new (require('./controllers/userController'))();
const storage = new (require('./controllers/reportController'))();

server.post('/evaluation', routeHandlerWrapper(evaluation));
server.post('/authentication', routeHandlerWrapper(authentication.handleUserRequest.bind(authentication)));
server.post('/storage', routeHandlerWrapper(storage.handleReportRequest.bind(storage)));

// Start the server listening on the specified port.
const PORT = 7070;
server.listen(PORT, () => {
    console.log("Server listening on: 0.0.0.0:" + PORT);
});

