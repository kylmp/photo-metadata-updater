var router = require('express').Router();
const directoryService = require('../service/photo-directory-service');
const exifSvc = require('../service/exiftool-service');
const bingMapsApi = require('../service/bing-maps-api-service');
const datetimeUtils = require('../utils/datetime-utils');
const validation = require('../utils/validation-utils');
const imgFolder = require('./image-folder');
const regex = require('../constants/regex');
const sse = require('../utils/sse-helper');

var currentDir = '';

/**
 * Get list of photo names in a directory
 */
router.get('/directory', function (req, res) {
  const directory = req.query.path || '';
  currentDir = (process.env.DEMO_MODE === 'true') ? process.env.DEMO_DIR : directory;
  directoryService.getPhotoList(currentDir).then(photoList => {
    imgFolder.setPath(currentDir);
    res.send(photoList);
  }).catch(err => { 
    if ((typeof err === 'string' || err instanceof String) && err.includes("No such file or directory")) {
      res.status(400).send();
    } else {
      res.status(500).send({error: err});
    }
  });
});

/**
 * Get list of photo names with metadata in a directory (Server Side Event Request)
 */
router.post('/directory', async function (req, res) {
  sse.init(res);

  for (let photo of req.body) {
    let status = 'success';
    const metadata = await exifSvc.getMetadata(`${currentDir}/${photo.name}`).catch(() => {
      status = 'error';
    });
    sse.send(res, metadata, status);
  }

  sse.close(res);
});

/**
 * Get metadata for a photo
 */
router.get('/metadata', function (req, res) {
  const photoName = req.query.name || '';
  if (photoName === '') {
    res.status(400).send({error: 'name required'});
    return;
  }

  exifSvc.getMetadata(`${currentDir}/${photoName}`).then(photoMetadata => {
    res.status(200).send(photoMetadata);
  }).catch(err => { 
    if ((typeof err === 'string' || err instanceof String) && err.includes("File not found")) {
      res.status(400).send();
    } else {
      res.status(500).send({error: err});
    }
  });
});

/**
 * Update metadata for a photo
 */
router.post('/metadata', function (req, res) {
  let metadata = req.body;
  metadata.file = `${currentDir}/${metadata.name}`;

  const errorMsg = validation.validateMetadata(metadata);
  if (errorMsg !== '') {
    res.status(400).send(errorMsg);
    return;
  }
  
  exifSvc.setMetadata(metadata).then((updatedMetadata) => {
    res.status(200).send(updatedMetadata);
  }).catch((err) => {
    res.status(500).send(err.message);
  });
});

/**
 * Batch update metadata for a list of photos (Server Side Event Request)
 */
 router.post('/batchupdate', async function(req, res) {
  sse.init(res);

  if (!(req.body instanceof Array)) {
    sse.close(res, {'error': 'metadata array expected'}, 'error');
    return;
  }

  for (let metadata of req.body) {
    let data;
    let status = 'success';
    metadata.file = `${currentDir}/${metadata.name}`;
    
    const errorMsg = validation.validateMetadata(metadata);
    if (errorMsg === '') {
      data = await exifSvc.setMetadata(metadata).catch(() => {
        status = 'error';
      }) || {'name': metadata.name, 'error': 'Exiftool Error'};
    }
    else {
      status = 'error'
      data = {'name': metadata.name, 'error': errorMsg};
    }

    sse.send(res, data, status);
  }

  sse.close(res);
});

/**
 * Calculate timezone offset from coordinates, date, and time [uses bing maps API]
 */
router.get('/calculate-timezone', function (req, res) {
  const metadata = {date: req.query.date, time: req.query.time, latitude: Number(req.query.lat), longitude: Number(req.query.lon)};
  const errorMsg = validation.validateMetadata(metadata, ['timezone', 'elevation']);
  if (errorMsg !== '') {
    res.status(400).send(errorMsg);
  }
  else {
    bingMapsApi.getTzOffsetFromCoordinates(metadata.latitude, metadata.longitude, metadata.date, metadata.time).then(offset => {
      res.status(200).send(datetimeUtils.encodeOffset(offset));
    }).catch(err => {
      res.status(500).send(err.message);
    });
  }
});

/**
 * Get app settings
 */
router.get('/settings', function(req, res) {
  const settings = {
    name: process.env.APP_NAME,
    demo: (process.env.DEMO_MODE === 'true') ? true : false,
    regex: regex.getAllStrings()
  }
  res.send(settings);
});

/**
 * Get maps API selection and key
 */
 router.get('/maps-api-key', function (req, res) {
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

module.exports = router;