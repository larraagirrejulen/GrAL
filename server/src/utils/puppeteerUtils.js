
const puppeteer = require('puppeteer');

/**
 * Wraps a function that requires a browser instance and returns its result after closing the browser.
 * @param {Function} fn - The function to be wrapped.
 * @returns {Promise} - A promise that resolves with the result of the wrapped function.
 */
const withBrowser = async (fn) => {
	let browser;
	try {
		browser = await puppeteer.launch({ 
			headless: true,
			args: ["--disable-setuid-sandbox", "--lang=en", '--start-maximized'],
			'ignoreHTTPSErrors': true
		});
		return await fn(browser);
	} finally {
		if(browser) await browser.close();
	}
}


/**
 * Wraps a function that requires a page instance and returns its result after closing the page.
 * @param {Object} browser - The browser instance to create the page on.
 * @returns {Function} - A function that accepts a function to be wrapped and returns a promise that resolves with the result of the wrapped function.
 */
const withPage = (browser) => async (fn) => {
	let page;
	try {
		page = await browser.newPage();
		await page.setViewport({ width: 1920, height: 1080});
		return await fn(page);
	} finally {
		if(page) await page.close();
	}
}

module.exports = {
    withBrowser,
    withPage
};