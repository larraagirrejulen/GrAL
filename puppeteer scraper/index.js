
const scraperController = require('./scrapingController');

// Pass the browser instance to the scraper controller
var results = scraperController(false, true, false, "https://www.ehu.eus/es/home");

