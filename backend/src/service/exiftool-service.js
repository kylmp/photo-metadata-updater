const shell = require('../utils/async-shell');
const path = require('path');
const datetimeUtils = require('../utils/datetime-utils');
const bingMapsApi = require('./map-service');
const directory = require('./directory-service');

const unknown = 'unknown';
const defaultDate = "1970-01-01 00:00:00";
const setOptions = '-q -q';
const getOptions = '-json -c "%+.8f" -n -q -CreateDate -DateTimeOriginal -ModifyDate -OffsetTime -OffsetTimeOriginal -OffsetTimeDigitized -GPSAltitude -GPSDateTime -GPSLatitude -GPSLongitude -FileTypeExtension -ImageSize -FileName -FileSize -ProjectionType';

let exiftool = process.env.EXIFTOOL_PATH || 'exiftool';
if (exiftool === 'bundled') {
  exiftool = (process.pkg) ? 
    path.join(path.dirname(process.execPath), './exiftool/exiftool') : 
    path.join(__dirname, '../../exiftool/exiftool');
}

const supportedImageTypes = process.env.SUPPORTED_FILE_TYPES || ['.jpg', '.jpeg', '.png'];

module.exports = {
  getMetadata: function(name) {
    const command = `"${exiftool}" ${getOptions} "${directory.getDirectory()}/${name}"`;
    return shell.exec(command).then(rawMetadata => {
      return mapMetadata(JSON.parse(rawMetadata)[0]);
    }).catch(err => { throw err });
  },

  getAllMetadata: function() {
    const getAllMetadataForImageType = supportedImageTypes.map(imgType => {
      return shell.exec(`"${exiftool}" ${getOptions} "${directory.getDirectory()}/"*${imgType}`).catch(err => {
        if (!(typeof err === 'string' && err.includes('File not found'))) throw err;
      });
    });

    return Promise.all(getAllMetadataForImageType).then(allImageTypeMetadata => {
      return allImageTypeMetadata
        .filter(exifMetadataForImgType => exifMetadataForImgType != undefined)
        .map(exifMetadataForImgType => JSON.parse(exifMetadataForImgType))
        .flat()
        .map(imageExifMetadata => mapMetadata(imageExifMetadata));
    }).catch(err => { throw err });
  },

  setMetadata: async function(metadata, saveBackup = false) {
    if (metadata.timezone === 'calculate') {
      metadata.timezone = datetimeUtils.encodeOffset(
        await bingMapsApi.getTzOffsetFromCoordinates(metadata.latitude, metadata.longitude, metadata.date, metadata.time));
    }

    const options = (saveBackup) ? setOptions : `${setOptions} -overwrite_original`;
    const file = `${directory.getDirectory()}/${metadata.name}`;
    const coordinates = buildCoordinatesExifFields(metadata.latitude, metadata.longitude);
    const elevation = buildElevationExifFields(metadata.elevation);
    const datetime = buildDatetimeExifFields(metadata.date, metadata.time, metadata.timezone);
    const command = `"${exiftool}" "${file}" ${options} ${coordinates} ${elevation} ${datetime}`;

    return shell.exec(command).then(() => {
      return module.exports.getMetadata(metadata.name).catch(err => { throw err });
    }).catch(err => { throw err });
  },

  deleteBackups: function() {
    const command = `"${exiftool}" "${directory.getDirectory()}" -delete_original! -q`;
    return shell.exec(command).catch(err => { throw err });
  },

  restoreBackups: function() {
    const command = `"${exiftool}" "${directory.getDirectory()}" -restore_original -q`;
    return shell.exec(command).catch(err => { throw err });
  },

  isAvailable: function() {
    return require('shelljs').exec(`"${exiftool}" -ver`, {silent: true}).code === 0;
  }
}

function mapMetadata(exifMetadata) {
  const {date, time, datetime} = datetimeUtils.parseDatetime(exifMetadata.DateTimeOriginal || exifMetadata.CreateDate || exifMetadata.ModifyDate || defaultDate);
  const latitude = exifMetadata.GPSLatitude || 0;
  const longitude = exifMetadata.GPSLongitude || 0;
  return { 
    'name': exifMetadata.FileName || unknown, 
    'size': formatBytes(exifMetadata.FileSize || 0),
    'date': date,
    'time': time,
    'timezone': determineTimezone(exifMetadata, datetime),
    'resolution': (exifMetadata.ImageSize || unknown).replaceAll(' ', 'x'),
    'projection': exifMetadata.ProjectionType || 'default',
    'latitude': latitude,
    'longitude': longitude,
    'elevation': exifMetadata.GPSAltitude || 0,
    'type': exifMetadata.FileTypeExtension || unknown,
    'isGeotagged': latitude !== 0 && longitude !== 0
  };
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const power = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, power)).toFixed(decimals < 0 ? 0 : decimals))} ${sizes[power]}`;
}


/* 1. Try to get from timezone exif metadata
 * 2. If not present, try to calculate offset from difference in GPS time (UTC) vs create date (local)
 * 3. If GPS time not present, then set timezone offset to unknown as we cannot determine it */
function determineTimezone(exifMetadata, createDate) {
  let timezoneOffset = exifMetadata.OffsetTimeOriginal || exifMetadata.OffsetTimeDigitized || exifMetadata.OffsetTime || unknown;
  if (timezoneOffset === unknown) {
    const gpsDatetime = datetimeUtils.parseDatetime(exifMetadata.GPSDateTime || defaultDate).datetime;
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
