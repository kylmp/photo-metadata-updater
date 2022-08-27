/**
 * Metadata Controller
 *   route: /api/metadata 
 */
const router = require('express').Router();
const validation = require('../utils/validation-utils');
const exif = require('../service/exiftool-service');
const sse = require('../utils/sse-helper');

/**
 * Get metadata for a photo
 * 
 * Query Params [name]
 *   name: String = Name of photo to fetch metadata for
 */
router.get('/', function (req, res) {
  const photoName = req.query.name || '';
  if (photoName === '') {
    res.status(400).send({error: 'name required'});
    return;
  }

  exif.getMetadata(photoName).then(photoMetadata => {
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
 * 
 * Request Body
 *   Format: application/json
 *   Data: metadata object with 7 fields <name, date, time, timezone, elevation, latitude, longitude>
 */
router.put('/', function (req, res) {
  const errorMsg = validation.validateMetadata(req.body);
  if (errorMsg !== '') {
    res.status(400).send(errorMsg);
    return;
  }
  
  exif.setMetadata(req.body).then((updatedMetadata) => {
    res.status(200).send(updatedMetadata);
  }).catch((err) => {
    res.status(500).send(err.message);
  });
});

/**
 * Batch update metadata for a list of photos (Server Side Event Request)
 * 
 * Request Body
 *   Format: application/json
 *   Data: Array of metadata objects with 7 fields <name, date, time, timezone, elevation, latitude, longitude>
 */
router.post('/', async function(req, res) {
  sse.init(res);

  if (!(req.body instanceof Array)) {
    sse.close(res, {'error': 'metadata array expected'}, 'error');
    return;
  }

  for (let metadata of req.body) {
    let data;
    let status = 'success';
    
    const errorMsg = validation.validateMetadata(metadata);
    if (errorMsg === '') {
      data = await exif.setMetadata(metadata).catch(() => {
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

module.exports = router;
