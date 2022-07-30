const appName = 'photo-metadata-updater';
console.log(`\nStarting ${appName}...`);

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './config.properties') });
const express = require('express');
const bodyParser = require('body-parser');
const shell = require('shelljs');
const app = express();
const imgFolder = require('./src/service/img-folder-service');
const exifToolService = require('./src/service/exiftool-service');

const port = process.env.PORT || 8000;
const bingApiKey = process.env.BING_API_KEY || 'YOUR_BING_API_KEY';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var server;

if (!exifToolService.isAvailable()) {
  console.log('\n\x1b[31mError\x1b[0m - You must have exiftool installed to run this app (https://exiftool.org/install.html)');
	console.log('... or update the EXIFTOOL_PATH variable in the config.properties file if already installed\n');
  shell.exit(1);
}

if (bingApiKey === 'YOUR_BING_API_KEY') {
	console.log('\n\x1b[33mWARNING\x1b[0m - map and timezone features will not work without a bing maps API key');
	console.log('Get one here: https://docs.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key');
	console.log('Then, add your API key to the .env file and restart the application\n')
}

console.log(`Running in the node ${process.env.NODE_ENV} environment`);

(async () => {
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use('/api', require('./src/route/routes'));
	app.use(express.static(path.join(__dirname, './public')));
	imgFolder.createImageFolder();
	server = app.listen(port, () => {
		console.log(`\x1b[32m${appName} is now running and available here: http://localhost:${port}\x1b[0m`);
	})
})();

const gracefulShutdown = () => {
	if (typeof server !== 'undefined') {
		console.log(`\nShutting down ${appName} server...`);
		imgFolder.deleteImageFolder();
		server.close(function () {
			console.log(`${appName} server shutdown.`);
		});
	}
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);