const path = require('path');
const appPath = (process.pkg) ? path.dirname(process.execPath) : __dirname;
const appName = 'photo-metadata-updater';
const configName = 'config.properties'
require('dotenv').config({ path: path.join(appPath, './'+configName) });
const port = process.env.PORT || 8000;

const express = require('express');
const app = express();
const shell = require('shelljs');
const bodyParser = require('body-parser');
const exifToolService = require('./src/service/exiftool-service');

var server;

console.log(`\nStarting ${appName}...`);

if (!exifToolService.isAvailable()) {
  console.log('\n\x1b[31mError\x1b[0m - You must have exiftool installed to run this app (https://exiftool.org/install.html)');
	console.log('... or update the EXIFTOOL_PATH variable in the config.properties file if already installed\n');
  shell.exit(1);
}

const bingApiKey = process.env.BING_API_KEY || 'YOUR_BING_API_KEY';
if (bingApiKey === 'YOUR_BING_API_KEY') {
	console.log('\n\x1b[33mWARNING\x1b[0m - map and timezone features will not work without a bing maps API key');
	console.log('Get one here: https://docs.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key');
	console.log('Then, add your API key to the config.properties file and restart the application\n')
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './public')));
app.use('/api', require('./src/middleware/routes'));
app.use('/img', require('./src/middleware/image-folder'));

server = app.listen(port, () => {
	console.log(`\x1b[32m${appName} is now running and available here: http://localhost:${port}\x1b[0m`);
});

const gracefulShutdown = () => {
	if (typeof server !== 'undefined') {
		console.log(`\nShutting down ${appName} server...`);
		server.close(function () {
			console.log(`${appName} server shutdown.`);
		});
	}
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);