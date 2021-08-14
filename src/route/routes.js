var express = require('express');
var router = express.Router();
const shellSvc = require('../service/shell-service');
const exifSvc = require('../service/exiftool-service');

router.get('/photos', async function (req, res) {
	let directory = req.query.dir;
	let recursive = req.query.recursive || false;
	if (directory) {
		shellSvc.getPhotos(directory, recursive).then(photos => {
			res.send(photos);
		}).catch(err => {
			res.status(500).send({error: err.message});
		});
	}
	else {
		res.status(400).send({error: 'dir query param not provided or empty'});
	}
});

module.exports = router;