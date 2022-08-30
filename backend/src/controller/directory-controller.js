/**
 * Directory Controller
 *   route: /api/directory 
 */
const router = require('express').Router();
const directory = require('../service/directory-service');
const exif = require('../service/exiftool-service');

/**
 * Get list of photos in a directory
 * 
 * Query Params [path]
 *   path: String = directory path to load photos from
 */
router.get('/', async function(req, res) {
  const dir = (process.env.DEMO_MODE === 'true') ? process.env.DEMO_DIR : (req.query.path || directory.getDirectory());

  const dirStatus = directory.setDirectory(dir);
  if (dirStatus !== 200) {
    res.status(dirStatus).send();
    return;
  }

  exif.getAllMetadata().then(metadata => {
    res.status(200).send(metadata);
  }).catch((err) => {
    console.log(err)
    res.status(500).send();
  })

  // res.status(200).send(exif.getAllMetadata());
});

module.exports = router;
