/**
 * Map Controller
 *   route: /api/map 
 */
const router = require('express').Router();
const validation = require('../utils/validation-utils');
const datetimeUtils = require('../utils/datetime-utils');
const bingMapsApi = require('../service/map-service');

/**
 * Get map selection and api key
 */
router.get('/info', async function (req, res) {
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

/**
 * Calculate timezone offset from coordinates, date, and time [uses bing maps API]
 * 
 * Query Params [date, time, latitude, longitude]
 *   name: String      = Date photo was taken
 *   time: String      = Time photo was taken
 *   latitude: Number  = Latitude photo was taken
 *   longitude: Number = Longitude photo was taken
 */
router.get('/timezone', async function (req, res) {
  const metadata = {
    date: req.query.date, 
    time: req.query.time, 
    latitude: Number(req.query.lat), 
    longitude: Number(req.query.lon)
  };

  const errorMsg = validation.validateMetadata(metadata, ['timezone', 'elevation']);
  if (errorMsg !== '') {
    res.status(400).send(errorMsg);
    return;
  }

  bingMapsApi.getTzOffsetFromCoordinates(metadata.latitude, metadata.longitude, metadata.date, metadata.time).then(offset => {
    res.status(200).send(datetimeUtils.encodeOffset(offset));
  }).catch(err => {
    res.status(500).send(err.message);
  });
});

module.exports = router;
