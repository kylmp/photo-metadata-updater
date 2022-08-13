const path = require('path');
const appPath = (process.pkg) ? path.dirname(process.execPath) : __dirname;
const configName = 'config.properties'
require('dotenv').config({ path: path.join(appPath, './'+configName) });
process.env.APP_PORT = process.env.APP_PORT || 8000;
process.env.APP_NAME = process.env.APP_NAME || 'Photo Metadata Updater';

const express = require('express');
const app = express();
const shell = require('shelljs');
const bodyParser = require('body-parser');
const exifToolService = require('./src/service/exiftool-service');

var server;

console.log(`\nStarting ${process.env.APP_NAME}...`);

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

if (process.env.CORS_ORIGIN) {
  const cors = require('cors')
  const corsOptions = {
    origin: process.env.CORS_ORIGIN
  }
  app.use(cors(corsOptions));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './public')));
app.use('/api', require('./src/middleware/api-routes'));
app.use('/img', require('./src/middleware/image-validator'));
app.use('/img', require('./src/middleware/image-folder'));

server = app.listen(process.env.APP_PORT, () => {
  console.log(`\x1b[32m${process.env.APP_NAME} is now running and available here: http://localhost:${process.env.APP_PORT}\x1b[0m`);
});

const gracefulShutdown = () => {
  if (typeof server !== 'undefined') {
    console.log(`\nShutting down ${process.env.APP_NAME} server...`);
    server.close(function () {
      console.log(`${process.env.APP_NAME} server shutdown.`);
    });
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);