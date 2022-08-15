var router = require('express').Router();
const directoryService = require('../service/photo-directory-service');
const exifSvc = require('../service/exiftool-service');
const datetimeUtils = require('../utils/datetime-utils');
const coordinatesUtils = require('../utils/coordinates-utils');
const bingMapsApi = require('../service/bing-maps-api-service');
const imgFolder = require('./image-folder');
const regex = require('../constants/regex');

var currentDir = '';

router.get('/settings', function(req, res) {
  const settings = {
    name: process.env.APP_NAME,
    demo: (process.env.DEMO_MODE === 'true') ? true : false,
    regex: regex.getAllStrings()
  }
  res.send(settings);
});

// If dir  query param: Get list of all photos in a directory (if metadata=true load times are long)
// If file query param: Get a single photo metadata
router.get('/photo', async function (req, res) {
  const directory = req.query.dir || '';
  const photoName = req.query.name || '';
  const withMetadata = req.query.metadata || false;
  if (directory !== '') {
    currentDir = (process.env.DEMO_MODE === 'true') ? process.env.DEMO_DIR : directory;
    directoryService.getPhotoList(currentDir, withMetadata).then(photoList => {
      imgFolder.setPath(currentDir);
      res.send(photoList);
    }).catch(err => { 
      if ((typeof err === 'string' || err instanceof String) && err.includes("No such file or directory")) {
        res.status(400).send();
      } else {
        res.status(500).send({error: err});
      }
    });
  }
  else if (photoName !== '') {
    const fullPhotoPath = `${currentDir}/${photoName}`;
    directoryService.getPhotoMetadata(fullPhotoPath).then(photoMetadata => {
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

// Update photo metadata [input and response should be lists of metadata]
router.post('/photo', async function (req, res) {
  if (!(req.body instanceof Array)) {
    res.status(400).send('Expected array of metadata');
    return;
  }

  const updatedMetadata = [];
  for (let metadata of req.body) {
    metadata.file = `${currentDir}/${metadata.name}`;

    const errorMsg = validateMetadata(metadata);
    if (errorMsg !== '') {
      res.status(400).send(errorMsg);
      return;
    }
    
    const updated = await exifSvc.setMetadata(metadata).catch((err) => {
      res.status(500).send(err.message);
      return;
    });

    updatedMetadata.push(updated);
  }
  res.status(200).send(updatedMetadata);
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
  const metadata = {date: req.query.date, time: req.query.time, latitude: req.query.lat, longitude: req.query.lon};
  const errorMsg = validateMetadata(metadata, ['timezone', 'elevation']);
  if (errorMsg !== '') {
    res.status(400).send(errorMsg);
  }
  else {
    bingMapsApi.getTzOffsetFromCoordinates(req.query.lat, req.query.lon, req.query.date, req.query.time).then(offset => {
      res.status(200).send(datetimeUtils.encodeOffset(offset));
    }).catch(err => {
      res.status(500).send(err.message);
    });
  }
});

function validateMetadata(metadata, ignore = []) {
  if (!ignore.includes('date') && !datetimeUtils.isValidDate(metadata.date)) {
    return 'invalid date';
  }
  else if (!ignore.includes('time') && !datetimeUtils.isValidTime(metadata.time)) {
    return 'invalid time';
  }
  else if (!ignore.includes('timezone') && !datetimeUtils.isValidOffset(metadata.timezone)) {
    return 'invalid timezone offset';
  }
  else if (!ignore.includes('coordinates') && !coordinatesUtils.isValidCoordinates(metadata.latitude, metadata.longitude)) {
    return 'invalid coordinates';
  }
  else if (!ignore.includes('elevation') && !coordinatesUtils.isValidElevation(metadata.elevation)) {
    return 'invalid elevation';
  }
  return '';
}

module.exports = router;