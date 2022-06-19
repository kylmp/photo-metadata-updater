const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const shell = require('shelljs');
const app = express();

const port = process.env.PORT || 8000;
const appName = 'photo-metadata-updater';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var server;

if (!shell.which('exiftool')) {
  shell.echo('-e', 'Error - You must have exiftool installed to run this app (https://exiftool.org/install.html)\n');
  shell.exit(1);
}

console.log(`\nStarting ${appName}...\nRunning in the node ${process.env.NODE_ENV} environment`);

(async () => {
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use('/api', require('./src/route/routes'));
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