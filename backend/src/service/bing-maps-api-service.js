const axios = require('axios');
const datetimeUtils = require('../utils/datetime-utils');

const baseUrl = process.env.BING_TZ_URL || 'https://dev.virtualearth.net/REST/v1/TimeZone';

var cache = {};

module.exports = {
  getTzOffsetFromCoordinates: async function (lat, lon, date, time) {
    const key = generateCacheKey(lat, lon, date);
    if (key in cache) {
      return cache[key];
    }

    const apiKey = process.env.BING_API_KEY || 'YOUR_BING_API_KEY';
    if (apiKey === 'YOUR_BING_API_KEY') {
      throw new Error("No bing API key in environment");
    }
    
    const datetime = datetimeUtils.getDateTimeUtcFormat(date, time);
    const response = await axios.get(`${baseUrl}/${lat},${lon}?datetime=${datetime}&key=${apiKey}`);
    const timezone = response.data.resourceSets[0].resources[0].timeZone;

    if (Object.keys(timezone) == 0) {
      return { hours: 0, minutes: 0, sign: '-' };
    }

    const utcOffset = timezone.convertedTime.utcOffsetWithDst.split(":");
    const sign = (utcOffset[0].includes('-')) ? '-' : '+';
    const hours = Number(utcOffset[0].replaceAll('-', ''));
    const minutes = Number(utcOffset[1]);
    const timezoneOffset = { hours: hours, minutes: minutes, sign: sign };
    cache[key] = timezoneOffset;
    return timezoneOffset;
  }
}

function generateCacheKey(lat, lon, date) {
  return `${encodeCoordinate(lat)}|${encodeCoordinate(lon)}|${date.replaceAll('-', '')}`;
}

function encodeCoordinate(coordinate) {
  return coordinate.toFixed(4).replaceAll('.', 'd').replaceAll('-', 'n');
}