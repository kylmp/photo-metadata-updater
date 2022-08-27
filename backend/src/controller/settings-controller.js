/**
 * Settings Controller
 *   route: /api/settings 
 */
const router = require('express').Router();
const validation = require('../utils/validation-utils');

/**
 * Get app settings
 */
router.get('/', function(req, res) {
  const settings = {
    name: process.env.APP_NAME,
    demo: (process.env.DEMO_MODE === 'true') ? true : false,
    regex: validation.getAllRegexStrings()
  }
  res.send(settings);
});

module.exports = router;
