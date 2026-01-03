const shell = require('../module/shell');
const path = require('path');
const datetimeUtils = require('../utils/datetime-utils');
const timezoneUtils = require('../utils/timezone-utils');
const directory = require('../middleware/directory');

const supportedImageTypes = (process.env.SUPPORTED_IMAGE_TYPES || "jpg jpeg png").toLowerCase().split(' ');
const unknown = 'unknown';
const defaultDate = "1970-01-01 00:00:00";
const setOptions = '-q -q';
const getOptions = '-json -c "%+.8f" -n -q';

let exiftool = process.env.EXIFTOOL_PATH || 'exiftool';
if (exiftool === 'bundled') {
  exiftool = (process.pkg) ? 
    path.join(path.dirname(process.execPath), './exiftool/exiftool') : 
    path.join(__dirname, '../../exiftool/exiftool');
}

module.exports = {
  getMetadata: function(name) {
    const command = `"${exiftool}" ${getOptions} "${directory.get()}/${name}"`;
    return shell.async(command).then(rawMetadata => {
      return mapMetadata(JSON.parse(rawMetadata)[0]);
    }).catch(err => { throw err });
  },

  getAllMetadata: function() {
    const getAllMetadataForImageType = supportedImageTypes.map(imgType => {
      return shell.async(`"${exiftool}" ${getOptions} "${directory.get()}/"*.${imgType}`).catch(err => {
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
        await timezoneUtils.calculateTimezoneOffset(metadata.latitude, metadata.longitude, metadata.date, metadata.time));
    }

    const options = (saveBackup) ? setOptions : `${setOptions} -overwrite_original`;
    const file = `${directory.get()}/${metadata.name}`;
    const coordinates = buildCoordinatesExifFields(metadata.latitude, metadata.longitude);
    const elevation = buildElevationExifFields(metadata.elevation);
    const datetime = buildDatetimeExifFields(metadata.date, metadata.time, metadata.timezone);
    const modified = buildFileModificationFields(metadata.date, metadata.time, metadata.timezone);
    const command = `"${exiftool}" "${file}" ${options} ${coordinates} ${elevation} ${datetime} ${modified}`;

    return shell.async(command).then(() => {
      return module.exports.getMetadata(metadata.name).catch(err => { throw err });
    }).catch(err => { throw err });
  },

  deleteBackups: function() {
    const command = `"${exiftool}" "${directory.get()}" -delete_original! -q`;
    return shell.async(command).catch(err => { throw err });
  },

  restoreBackups: function() {
    const command = `"${exiftool}" "${directory.get()}" -restore_original -q`;
    return shell.async(command).catch(err => { throw err });
  },

  isAvailable: function() {
    return shell.sync(`"${exiftool}" -ver`).code === 0;
  }
}

function mapMetadata(exifMetadata) {
  const {date, time, datetime} = datetimeUtils.parseDatetime(exifMetadata.DateTimeOriginal || exifMetadata.CreateDate || exifMetadata.ModifyDate || defaultDate);
  const latitude = exifMetadata.GPSLatitude || 0;
  const longitude = exifMetadata.GPSLongitude || 0;
  const elevation = (exifMetadata.GPSAltitude || 0) === "undef" ? 0 : (exifMetadata.GPSAltitude || 0);
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
    'elevation': elevation,
    'type': exifMetadata.FileTypeExtension || unknown,
    'isGeotagged': latitude !== 0 && longitude !== 0,
    'raw': exifMetadata
  };
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const power = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, power)).toFixed(decimals < 0 ? 0 : decimals))} ${sizes[power]}`;
}

/* 1. Try to get offset from timezone exif metadata
 * 2. Try to calculate offset from difference in GPS time (UTC) vs create date (local)
 * 3. Otherwise, return 'unknown' */
function determineTimezone(exifMetadata, localDateTime) {
  const timezoneOffset = exifMetadata.OffsetTimeOriginal || exifMetadata.OffsetTimeDigitized || exifMetadata.OffsetTime || unknown;
  if (timezoneOffset === unknown && 'GPSDateTime' in exifMetadata) {
    const utcDateTime = datetimeUtils.parseDatetime(exifMetadata.GPSDateTime).datetime;
    return datetimeUtils.determineOffset(utcDateTime, localDateTime);
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

function buildDatetimeExifFields(date, time, offset) {
  // Get values for local time
  const datetime = `${date} ${time}`;
  const cmdLocal = `"-DateTimeOriginal=${datetime}" "-CreateDate=${datetime}" "-ModifyDate=${datetime}"`;

  // Get values for UTC time (GPS date/time tags should be in UTC)
  const {date: utcDate, time: utcTime} = datetimeUtils.offsetDatetime(offset, date, time);
  const utcDatetime = `${utcDate} ${utcTime}`;
  const cmdGps = `"-GPSDateTime=${utcDatetime}" "-GPSDateStamp=${utcDate}" "-GPSTimeStamp=${utcTime}"`;

  // Set the timezone offset
  const cmdOffset = `"-OffsetTimeOriginal=${offset}" "-OffsetTime=${offset}" "-OffsetTimeDigitized=${offset}"`

  return `${cmdLocal} ${cmdGps} ${cmdOffset}`;
}

function buildFileModificationFields(date, time, offset) {
  const modificationDatetime = `${date} ${time}${offset}`;
  return `"-FileInodeChangeDate=${modificationDatetime}" "-FileModifyDate=${modificationDatetime}"`;
}
