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
			}).catch(err => { 
        err.includes("No such file or directory") ? res.status(400).send() : res.status(500).send({error: err});
      });
		}
		else { 
			shellSvc.getPhotoList(directory, recursive).then(photos => {
				res.send(photos);
			}).catch(err => { 
        err.includes("No such file or directory") ? res.status(400).send() : res.status(500).send({error: err});
      });
		}
	}
	else if (file !== '') {
    shellSvc.getPhotoMetaData(file).then(photo => {
      res.send(photo);
      imgFolder.movePhotoToImageFolder(file);
    }).catch(err => { 
      err.includes("File not found") ? res.status(400).send() : res.status(500).send({error: err});
    });
	}
	else {
		res.status(400).send({error: 'dir or file query param required'});
	}
});

router.get('/photo-available', async function(req, res) {
  let name = req.query.name || '';
  if (name) {
    imgFolder.isPhotoAvailable(name).then(result => {
      res.send(result);
    })
    .catch(err => { res.status(500).send({error: err.message}); });
  }
  else {
    res.status(400).send('name query parameter required');
  }
});

// Update a photos metadata
router.post('/photo', async function (req, res) {
  let response = '';
  const { file, longitude, latitude, elevation, date, time, camera } = req.body;
	response += exifSvc.setGeotag(file, latitude, longitude) ? '' : 'Error updating coordinates, '
  response += exifSvc.setDateTime(file, date, time) ? '' : 'Error updating create date and time, '
  response += exifSvc.setCamera(file, camera) ? '' : 'Error updating camera, '
  response += exifSvc.setElevation(file, elevation) ? '' : 'Error updating elevation, '
	if (response === '') {
		res.status(200).send("Updated");
	}
  else {
    res.status(500).send(response.slice(0, -2));
  }
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