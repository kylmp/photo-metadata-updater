/**
 * Directory Controller
 *   route: /api/directory 
 */
const router = require('express').Router();
const directory = require('../service/directory-service');
const exif = require('../service/exiftool-service');
const sse = require('../utils/sse-helper');

/**
 * Get list of photos in a directory
 * 
 * Query Params [path, metadata]
 *   path: String      = directory path to load photos from, if not provided previous cached value is used
 *   metadata: Boolean = whether or not to return metadata with photos (server side event request)
 */
router.get('/', async function(req, res) {
  const dir = (process.env.DEMO_MODE === 'true') ? process.env.DEMO_DIR : (req.query.path || directory.getDirectory());
  if (dir !== directory.getDirectory()) {
    const loadStatus = await directory.setDirectory(dir);
    if (loadStatus !== 200) {
      res.status(loadStatus).send();
      return;
    }
  }

  if (req.query.metadata !== 'true') {
    res.status(200).send(directory.getPhotos());
  }
  else {
    sse.init(res);
    for (const photo of directory.getPhotos()) {
      let status = 'success';
      const metadata = await exif.getMetadata(photo.name).catch(() => {
        status = 'error';
      });
      sse.send(res, metadata, status);
    }
    sse.close(res);
  }
});

module.exports = router;
