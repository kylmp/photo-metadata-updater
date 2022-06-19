var express = require('express');
var router = express.Router();
const shellSvc = require('../service/shell-service');
const exifSvc = require('../service/exiftool-service');

// Get list of all photos in a directory (with metadata optional - long load times)
// or get a single photo metadata by providing a file path
router.get('/photo', async function (req, res) {
	let directory = req.query.dir || '';
	let recursive = req.query.recursive || false;
	let file = req.query.file || '';
	if (directory !== '') {
		let withMetaData = req.query.metadata || false;
		if (withMetaData) {
			shellSvc.getPhotoListWithMetaData(directory, recursive).then(photos => {
				res.send(photos);
			})
			.catch(err => { res.status(500).send({error: err.message}); });
		}
		else { 
			shellSvc.getPhotoList(directory, recursive).then(photos => {
				res.send(photos);
			})
			.catch(err => { res.status(500).send({error: err.message}); });
		}
	}
	else if (file !== '') {
		shellSvc.getPhotoMetaData(file).then(photo => {
			res.send(photo);
		})
		.catch(err => { res.status(500).send({error: err.message}); });
	}
	else {
		res.status(400).send({error: 'dir or file query param required'});
	}
});

// Update a photo longitude and latitude metadata
router.post('/photo', async function (req, res) {
	let updated = exifSvc.setGeotag(req.body.file, req.body.latitude, req.body.longitude);
	if (updated) {
		res.status(200).send("Updated");
	}
	res.status(500).send("Error updating metadata");
});

module.exports = router;