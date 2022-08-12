var router = require('express').Router();
const directoryService = require('../service/photo-directory-service');
const exifSvc = require('../service/exiftool-service');
const datetimeUtils = require('../utils/datetime-utils');
const coordinatesUtils = require('../utils/coordinates-utils');
const bingMapsApi = require('../service/bing-maps-api-service');
const imgFolder = require('./image-folder');
const regex = require('../constants/regex');

router.get('/settings', function(req, res) {
  const settings = {
    name: process.env.APP_NAME,
    port: process.env.APP_PORT,
    regex: regex.getAllStrings()
  }
  res.send(settings);
});

// If dir  query param: Get list of all photos in a directory (if metadata=true load times are long)
// If file query param: Get a single photo metadata
router.get('/photo', async function (req, res) {
  const directory = req.query.dir || '';
  const photoFile = req.query.file || '';
  const withMetadata = req.query.metadata || false;
  if (directory !== '') {
    directoryService.getPhotoList(directory, withMetadata).then(photoList => {
      imgFolder.setPath(directory);
      res.send(photoList);
    }).catch(err => { 
      if ((typeof err === 'string' || err instanceof String) && err.includes("No such file or directory")) {
        res.status(400).send();
      } else {
        res.status(500).send({error: err});
      }
    });
  }
  else if (photoFile !== '') {
    directoryService.getPhotoMetadata(photoFile).then(photoMetadata => {
      res.status(200).send(photoMetadata);
    }).catch(err => { 
      if ((typeof err === 'string' || err instanceof String) && err.includes("File not found")) {
        res.status(400).send();
      } else {
        res.status(500).send({error: err});
      }
    });
  }
  else {
    res.status(400).send({error: 'dir or file query param required'});
  }
});

// Update a photos metadata
router.post('/photo', function (req, res) {
  const metadata = req.body;
  if (!datetimeUtils.isValidDate(metadata.date)) {
    res.status(400).send('invalid date');
  }
  else if (!datetimeUtils.isValidTime(metadata.time)) {
    res.status(400).send('invalid time');
  }
  else if (!datetimeUtils.isValidOffset(metadata.tzOffset)) {
    res.status(400).send('invalid timezone offset');
  }
  else if (!coordinatesUtils.isValidCoordinates(metadata.latitude, metadata.longitude)) {
    res.status(400).send('invalid coordinates');
  }
  else if (!coordinatesUtils.isValidElevation(metadata.elevation)) {
    res.status(400).send('invalid elevation');
  }
  else {
    exifSvc.setMetadata(metadata).then((response) => {
      res.status(200).send(response);
    }).catch(err => {
      res.status(500).send(err.message);
    });
  }
});

// Get map provider API key
router.get('/maps-api-key', async function (req, res) {
  const apiProvider = req.query.provider || process.env.SELECTED_MAP_TYPE || 'BING';
  let apiKey = '';
  switch (apiProvider.toUpperCase()) {
    case 'GOOGLE':
      apiKey = process.env.GOOGLE_API_KEY || '';
      break;
    default:
      apiKey = process.env.BING_API_KEY || '';
  }
  if (apiKey !== '') {
    res.status(200).send({'provider': apiProvider.toUpperCase(), 'key': apiKey});
  }
  else {
    res.status(400).send('No maps API key for '+apiProvider+' in .env file!');
  }
});

// Calculate timezone offset from coordinates and datetime info
router.get('/calculate-timezone', async function (req, res) {
  const lon  = req.query.lon;
  const lat  = req.query.lat;
  const date = req.query.date;
  const time = req.query.time;
  if (!datetimeUtils.isValidDate(date)) {
    res.status(400).send('invalid date');
  }
  else if (!datetimeUtils.isValidTime(time)) {
    res.status(400).send('invalid time');
  }
  else if (!coordinatesUtils.isValidCoordinates(lat, lon)) {
    res.status(400).send('invalid coordinates');
  }
  else {
    bingMapsApi.getTzOffsetFromCoordinates(lat, lon, date, time).then(offset => {
      res.status(200).send(datetimeUtils.encodeOffset(offset));
    }).catch(err => {
      res.status(500).send(err.message);
    });
  }
});

module.exports = router;