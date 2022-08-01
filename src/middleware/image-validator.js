var router = require('express').Router();

const allowedTypesRegex = /^.*\.(jpg|JPG|jpeg|JPEG|png|PNG)$/;

router.get('/*', function (req, res, next) {
  (allowedTypesRegex.test(req.url)) ? next() : res.status(400).send('Invalid photo extenstion type');
});

module.exports = router;