const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const port = process.env.PORT || 8000;
const appName = 'photo-metadata-updater';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var server;

console.log(`\nStarting ${appName}...\nRunning in the node ${process.env.NODE_ENV} environment`);

(async () => {
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(express.static(path.join(__dirname, './public')));
	server = app.listen(port, () => {
		console.log(`${appName} is now running on port ${port}`);
	})
})();

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