const shell = require('shelljs');
const asyncShell = require('../utils/async-shell');
const coordinatesUtils = require('../utils/coordinates-utils');
const datetimeUtils = require('../utils/datetime-utils');

const exiftool = process.env.EXIFTOOL_PATH || 'exiftool';
const options = '-overwrite_original -q -q';

module.exports = {
	setGeotag: function(file, lat, lon) {
		if (coordinatesUtils.isValidCoordinates(lat, lon)) {
			let latRef = (lat < 0) ? 'S' : 'N';
			let lonRef = (lon < 0) ? 'W' : 'E';
			let cmd = `${exiftool} "${file}" -gpslatitude=${lat}  -gpslongitude=${lon} -gpslatituderef=${latRef} -gpslongituderef=${lonRef} ${options}`;
      if (shell.exec(cmd).code === 0) {
				return true;
			}
		}
    else {
      console.log('invalid coordinates')
    }
		return false;
	},

  // Input date requires format YYYY-MM-DD | Input time requires format HH:MM:SS
  setDateTime: function(file, date, time) {
    if (/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(date) && /[0-9]{2}:[0-9]{2}:[0-9]{2}/.test(time)) {
      const datetime = `${date.replaceAll("-", ":")} ${time}`;
      const cmd = `${exiftool} "${file}" -datetimeoriginal="${datetime}" -createdate="${datetime}" ${options}`;
      if (shell.exec(cmd).code === 0) {
        return true;
      }
    }
    return false;
  },

  setCamera: function(file, camera) {
    const cmd = `${exiftool} "${file}" -model="${camera}" ${options}`;
    if (shell.exec(cmd).code === 0) {
      return true;
    }
    return false;
  },

  setElevation: function(file, elevation) {
    const direction = (elevation.charAt(0) === '-') ? "Below Sea Level" : "Above Sea Level"
    elevation = elevation.replaceAll('m', '');
    elevation = elevation.replaceAll('M', '');
    const formattedElevation = `${elevation} m ${direction}`;
    const cmd = `${exiftool} "${file}" -gpsaltitude=="${formattedElevation}" ${options}`;
    if (shell.exec(cmd).code === 0) {
      return true;
    }
    return false;
  },

  getMetaData: async function(file) {
    let exifDataMap = new Map();
    const data = await asyncShell.exec(`${exiftool} "${file}"`).catch(err => {throw err});
    data.split(/\r?\n/).forEach((line) => {
      let exifLine = line.split(': ');
      exifDataMap.set(exifLine[0].trim(), exifLine[1]);
    });
    const datetime = exifDataMap.get('Date/Time Original') || exifDataMap.get('Create Date') || "1970:01:01 00:00:00";
    const {date, time} = datetimeUtils.dateTimeToFormattedObj(datetime);
    let res = { 
      'name': exifDataMap.get('File Name') || 'unknown', 
      'path': file,
      'size': exifDataMap.get('File Size') || 'unknown',
      'camera': exifDataMap.get('Camera Model Name') || 'unknown',
      'createDate': date,
      'createTime': time,
      'resolution': exifDataMap.get('Image Size') || 'unknown',
      'projection': exifDataMap.get('Projection Type') || 'unknown',
      'coordinates': coordinatesUtils.geotagToCoordinates(exifDataMap.get('GPS Position')),
      'elevation': mapElevation(exifDataMap.get('GPS Altitude') || '0 m Above') 
    };
    res.isGeotagged = (res.coordinates.latitude !== 0 && res.coordinates.longitude !== 0);
    return res;
  }
}

function mapElevation(elevation) {
  let split = elevation.split(" ");
  let value = split[0] + split[1];
  return (split[2] === "Below") ? '-' + value : value;
}