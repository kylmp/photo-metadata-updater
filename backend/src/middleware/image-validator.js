var router = require('express').Router();

const supportedImageTypes = (process.env.SUPPORTED_IMAGE_TYPES || "jpg jpeg png").toLowerCase().split(' ');

router.get('/*', function (req, res, next) {
  const url = req.url.toLowerCase();
  supportedImageTypes.some(imageType => url.endsWith(imageType)) ? next() : res.status(400).send('Invalid photo extenstion type');
});

module.exports = router;
