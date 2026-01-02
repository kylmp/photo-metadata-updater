/**
 * Map Controller
 *   route: /api/map 
 */
const router = require('express').Router();

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
    res.status(400).send('No maps API key for '+apiProvider+' in config.properties file!');
  }
});

module.exports = router;
