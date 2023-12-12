
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const scraperController = require('./controllers/scrapingController');
const UserController = require('./controllers/userController');
const ReportController = require('./controllers/reportController');
const userController = new UserController();
const reportController = new ReportController();


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


server.post('/scrapeAccessibilityResults', routeHandlerWrapper(scraperController));
server.post('/userAuthentication', routeHandlerWrapper(userController.handleUserRequest.bind(userController)));
server.post('/reportStoring', routeHandlerWrapper(reportController.handleReportRequest.bind(reportController)));


// Start the server listening on the specified port.
const PORT = 7070;
server.listen(PORT, () => {
    console.log("Server listening on: 0.0.0.0:" + PORT);
});

