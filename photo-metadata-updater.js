const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const shell = require('shelljs');
const app = express();
const imgFolder = require('./src/service/img-folder-service');
require('dotenv').config({ path: path.join(__dirname, './config.properties') });

const port = process.env.PORT || 8000;
const appName = 'photo-metadata-updater';
const bingApiKey = process.env.BING_API_KEY || 'YOUR_BING_API_KEY';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var server;

if (!shell.which('exiftool')) {
  shell.echo('-e', 'Error - You must have exiftool installed to run this app (https://exiftool.org/install.html)');
	shell.echo('-e', '... or update the EXIFTOOL_PATH variable in the .env file if already installed');
  shell.exit(1);
}

if (bingApiKey === 'YOUR_BING_API_KEY') {
	shell.echo('-e', '\nWARNING - map and timezone features will not work without a bing maps API key');
	shell.echo('-e', 'Get one here: https://docs.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key');
	shell.echo('-e', 'Then, add your API key to the .env file and restart the application')
}

console.log(`\nStarting ${appName}...\nRunning in the node ${process.env.NODE_ENV} environment`);

(async () => {
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use('/api', require('./src/route/routes'));
	app.use(express.static(path.join(__dirname, './public')));
	imgFolder.createImageFolder();
	server = app.listen(port, () => {
		console.log(`${appName} is now running on port ${port}`);
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