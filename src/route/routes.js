var express = require('express');
var router = express.Router();
const shellSvc = require('../service/shell-service');
const exifSvc = require('../service/exiftool-service');
const imgFolder = require('../service/img-folder-service');

// Get list of all photos in a directory (with metadata optional - long load times)
// or get a single photo metadata by providing a file path
router.get('/photo', async function (req, res) {
	let directory = req.query.dir || '';
	let recursive = req.query.recursive || false;
	let file = req.query.file || '';
  let isMetaData = req.query.metadata || false;
	if (directory !== '') {
		if (isMetaData) {
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
      imgFolder.movePhotoToImageFolder(file);
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

router.get('/bing-api-key', async function (req, res) {
  const apiKey = process.env.BING_API_KEY || '';
  if (apiKey !== '') {
    res.status(200).send(apiKey);
  }
  else {
    res.status(400).send('No BING_API_KEY in .env file!');
  }
})

module.exports = router;