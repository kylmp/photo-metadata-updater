/**
 * Directory Controller
 *   route: /api/directory 
 */
const router = require('express').Router();
const directory = require('../middleware/directory');
const exif = require('../service/exiftool-service');

/**
 * Update the selected directory
 * 
 * Request Body
 *   directory: String = directory (full path) to load photos from
 * 
 * Returns a list of all of the photo metadata in that directory
 */
router.put('/', async function(req, res) {
  const dir = (process.env.DEMO_MODE === 'true') ? process.env.DEMO_DIR : (req.body.directory || '');

  if (dir === '' || !directory.update(dir)) {
    res.status(400).send((dir === '') ? 'directory required' : 'directory does not exist');
    return;
  }

  exif.getAllMetadata().then(metadata => {
    res.status(200).send(metadata);
  }).catch(() => {
    res.status(500).send();
  });
});

module.exports = router;
