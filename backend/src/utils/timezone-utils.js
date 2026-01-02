const datetimeUtils = require('./datetime-utils');
const tzlookup = require("tz-lookup");
const { DateTime } = require("luxon");

module.exports = {
  calculateTimezoneOffset: async function (lat, lon, date, time) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error("Invalid coordinates");
    }
    if (!time) {
      throw new Error("Time is required");
    }
    const timezone = tzlookup(lat, lon);
    const utc = DateTime.fromISO(datetimeUtils.getDateTimeUtcFormat(date, time), { zone: "utc" });
    const utcOffset = utc.setZone(timezone).toFormat('ZZ').split(":");
    return { 
      sign: (utcOffset[0].includes('-')) ? '-' : '+',
      hours: Number(utcOffset[0].replaceAll('-', '')), 
      minutes: Number(utcOffset[1]),
    };
  }
}
