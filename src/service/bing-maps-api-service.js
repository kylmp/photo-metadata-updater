const axios = require('axios');
const datetimeUtils = require('../utils/datetime-utils');

const baseUrl = process.env.BING_TZ_URL || 'https://dev.virtualearth.net/REST/v1/TimeZone';

module.exports = {
  getTzOffsetFromCoordinates: async function (lat, lon, date, time) {
    const apiKey = process.env.BING_API_KEY || '';
    if (apiKey === '') {
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
    return { hours: hours, minutes: minutes, sign: sign };
  }
}