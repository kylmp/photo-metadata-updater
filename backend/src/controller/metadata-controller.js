/**
 * Metadata Controller
 *   route: /api/metadata 
 */
const router = require('express').Router();
const validation = require('../utils/validation-utils');
const exif = require('../service/exiftool-service');
const sse = require('../utils/sse-utils');

/**
 * Get metadata for a photo
 * 
 * Query Params [name]
 *   name: String = Name of photo to fetch metadata for
 */
router.get('/', async function (req, res) {
  const photoName = req.query.name || '';
  if (photoName === '') {
    res.status(400).send({error: 'name required'});
    return;
  }

  exif.getMetadata(photoName).then(metadata => {
    res.status(200).send(metadata);
  }).catch(err => {
    (typeof err === 'string' && err.includes("File not found")) ? res.status(400).send() : res.status(500).send();
  });
});

/**
 * Update metadata for a photo
 * 
 * Request Body
 *   Format: application/json
 *   Data: metadata object with 7 fields <name, date, time, timezone, elevation, latitude, longitude>
 */
router.put('/', async function (req, res) {
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
let cancelled;
router.post('/', async function(req, res) {
  cancelled = false;
  sse.init(res);

  if (!(req.body instanceof Array)) {
    sse.close(res, {'error': 'metadata array expected'}, 'error');
    return;
  }

  for (let metadata of req.body) {
    if (cancelled) break;

    let data;
    let status = 'success';
    
    const errorMsg = validation.validateMetadata(metadata);
    if (errorMsg === '') {
      data = await exif.setMetadata(metadata, true).catch(() => {
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
 * Cancel the batch update in progress (if any)
 */
router.get('/cancel-batch-update', async function (req, res) {
  cancelled = true;
  res.status(200).send();
});

/**
 * Restore all backed up image files (used after batchupdate revert)
 */
router.get('/backup', async function (req, res) {
  exif.restoreBackups()
    .then(() => res.status(200).send())
    .catch(() => res.status(500).send());
});

/**
 * Delete all backed up image files (used after batchupdate confirmation)
 */
 router.delete('/backup', async function (req, res) {
  exif.deleteBackups()
    .then(() => res.status(200).send())
    .catch(() => res.status(500).send());
});

module.exports = router;
