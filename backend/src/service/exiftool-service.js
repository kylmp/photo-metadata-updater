const shell = require('shelljs');
const path = require('path');
const asyncShell = require('../utils/async-shell');
const coordinatesUtils = require('../utils/coordinates-utils');
const datetimeUtils = require('../utils/datetime-utils');
const bingMapsApi = require('./map-service');
const directoryService = require('./directory-service');

const unknown = 'unknown';
const defaultDate = "1970-01-01 00:00:00";
const options = '-overwrite_original -q -q';

let exiftool = process.env.EXIFTOOL_PATH || 'exiftool';
if (exiftool === 'bundled') {
  exiftool = (process.pkg) ? 
    path.join(path.dirname(process.execPath), './exiftool/exiftool') : 
    path.join(__dirname, '../../exiftool/exiftool');
}

module.exports = {
  getMetadata: async function(name) {
    const file = `${directoryService.getDirectory()}/${name}`;
    const rawExifData = await asyncShell.exec(`"${exiftool}" "${file}"`).catch(err => {throw err});
    const exifDataMap = new Map(rawExifData.split(/\r?\n/).map(metadataLine => {
      const metadataParts = metadataLine.split(': ').map(metadataPart => metadataPart.trim());
      return [metadataParts[0], metadataParts[1]];
    }));

    const locdatetime = exifDataMap.get('Date/Time Original') || exifDataMap.get('Create Date') || exifDataMap.get('Modify Date') || defaultDate;
    const {date, time, datetime} = datetimeUtils.parseDatetime(locdatetime);
    const {latitude, longitude} = coordinatesUtils.geotagToCoordinates(exifDataMap.get('GPS Position'));

    return { 
      'name': exifDataMap.get('File Name') || unknown, 
      'size': exifDataMap.get('File Size') || unknown,
      'date': date,
      'time': time,
      'timezone': determineTimezone(exifDataMap, datetime),
      'resolution': exifDataMap.get('Image Size') || unknown,
      'projection': exifDataMap.get('Projection Type') || 'default',
      'latitude': latitude,
      'longitude': longitude,
      'elevation': mapElevation(exifDataMap.get('GPS Altitude') || '0 m Above') || 0,
      'type': exifDataMap.get('File Type Extension') || unknown,
      'isGeotagged': latitude !== 0 && longitude !== 0
    };
  },

  setMetadata: async function(metadata) {
    if (metadata.timezone === 'calculate') {
      metadata.timezone = datetimeUtils.encodeOffset(
        await bingMapsApi.getTzOffsetFromCoordinates(metadata.latitude, metadata.longitude, metadata.date, metadata.time));
    }

    const file = `${directoryService.getDirectory()}/${metadata.name}`;
    const coordinates = buildCoordinatesExifFields(metadata.latitude, metadata.longitude);
    const elevation = buildElevationExifFields(metadata.elevation);
    const datetime = buildDatetimeExifFields(metadata.date, metadata.time, metadata.timezone);

    const command = `"${exiftool}" "${file}" ${options} ${coordinates} ${elevation} ${datetime}`;

    if (shell.exec(command).code !== 0) {
      console.log(`Error setting metadata photo=${metadata.name}`);
      throw new Error('exiftool error');
    }
    return await module.exports.getMetadata(metadata.name).catch(err => console.log(err));
  },

  isAvailable: function() {
    return shell.exec(`"${exiftool}" -ver`, {silent: true}).code === 0;
  }
}

function mapElevation(elevation) {
  let split = elevation.split(" ");
  let value = split[0];
  return Number((split[2] === "Below") ? `-${value}` : value);
}

function determineTimezone(exifDataMap, createDate) {
  // 1. Try to get from OffsetTime/OffsetTimeOriginal exif metadata
  // 2. If not present, try to calculate offset from difference in GPS time (UTC) vs create date (local)
  // 3. If GPS time not present, then set timezone offset to unknown as we cannot determine it
  let timezoneOffset = exifDataMap.get('Offset Time Original') || exifDataMap.get('Offset Time Digitized') || exifDataMap.get('Offset Time') || unknown;
  if (timezoneOffset === unknown) {
    const gpsDatetime = datetimeUtils.parseDatetime(exifDataMap.get('GPS Date/Time') || defaultDate).datetime;
    timezoneOffset = (gpsDatetime !== defaultDate) ? datetimeUtils.determineOffset(gpsDatetime, createDate) : unknown;
  }
  return timezoneOffset;
}

function buildElevationExifFields(elevation) {
  const direction = (elevation < 0) ? "Below Sea Level" : "Above Sea Level"
  elevation = (elevation < 0) ? elevation * -1 : elevation;
  return `"-GPSAltitude=${elevation} m ${direction}" "-GPSAltitudeRef=${direction}"`;
}

function buildCoordinatesExifFields(lat, lon) {
  let latRef = (lat < 0) ? 'S' : 'N';
  let lonRef = (lon < 0) ? 'W' : 'E';
  return `"-GPSLatitude=${lat}" "-GPSLongitude=${lon}" "-GPSLatitudeRef=${latRef}" "-GPSLongitudeRef=${lonRef}"`;
}

function buildDatetimeExifFields(date, time, timezoneOffset) {
  // Get values for local time
  const datetime = `${date} ${time}`;
  const cmdLocal = `"-DateTimeOriginal=${datetime}" "-CreateDate=${datetime}" "-ModifyDate=${datetime}"`;

  // Get values for UTC time (GPS date/time tags should be in UTC)
  const {date: utcDate, time: utcTime} = datetimeUtils.offsetDatetime(timezoneOffset, date, time);
  const utcDatetime = `${utcDate} ${utcTime}`;
  const cmdGps = `"-GPSDateTime=${utcDatetime}" "-GPSDateStamp=${utcDate}" "-GPSTimeStamp=${utcTime}"`;

  // Set the timezone offset
  const cmdOffset = `"-OffsetTimeOriginal=${timezoneOffset}" "-OffsetTime=${timezoneOffset}" "-OffsetTimeDigitized=${timezoneOffset}"`

  return `${cmdLocal} ${cmdGps} ${cmdOffset}`;
}