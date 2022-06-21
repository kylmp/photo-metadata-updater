const shell = require('shelljs');
const asyncShell = require('../utils/async-shell');
const coordinatesUtils = require('../utils/coordinates-utils');

module.exports = {
	setGeotag: function(file, lat, lon) {
		if (coordinatesUtils.isValidCoordinates(lat, lon)) {
			let latRef = (lat < 0) ? 'S' : 'N';
			let lonRef = (lon < 0) ? 'W' : 'E';
			let cmd = `exiftool ${file} -gpslatitude=${lat}  -gpslongitude=${lon} -gpslatituderef=${latRef} -gpslongituderef=${lonRef}`;
			if (shell.exec(cmd).code === 0) {
				return true;
			}
		}
		return false;
	},

  // Input date requires format YYYY-MM-DD | Input time requires format HH:MM:SS
  setDateTime: function(file, date, time) {
    if (/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(date) && /[0-9]{2}:[0-9]{2}:[0-9]{2}/.test(time)) {
      const datetime = `${date.replaceAll("-", ":")} ${time}`;
      const cmd = `exiftool ${file} -datetimeoriginal="${datetime}" -createdate="${datetime}"`;
      if (shell.exec(cmd).code === 0) {
        return true;
      }
    }
    return false;
  },

  setCamera: function(file, camera) {
    const cmd = `exiftool ${file} -model="${camera}"`;
    if (shell.exec(cmd).code === 0) {
      return true;
    }
    return false;
  },

	getMetaData: async function(file) {
		let infoMap = new Map();
		let data = await asyncShell.exec(`exiftool "${file}"`).catch(err => {throw err});
		data.split(/\r?\n/).forEach((item) => {
			let tmp = item.split(': ');
			infoMap.set(tmp[0].trim(), tmp[1]);
		});
    const {date, time} = extractDateTime(infoMap.get('Create Date'));
		let res = { 
			'name': infoMap.get('File Name'), 
			'path': file,
			'type': infoMap.get('File Type'),
			'size': infoMap.get('File Size'),
			'camera': infoMap.get('Camera Model Name'),
			'createDate': date,
      'createTime': time,
			'resolution': infoMap.get('Image Size'),
			'projection': infoMap.get('Projection Type'),
			'coordinates': coordinatesUtils.geotagToCoordinates(infoMap.get('GPS Position')),
      'elevation': mapElevation(infoMap.get('GPS Altitude') || '0 m Above') 
		};
		res.isGeotagged = (res.coordinates.latitude === 0 && res.coordinates.longitude === 0) ? false : true;
		res.isHdr = res.name.includes("HDR");
		return res;
	}
}

function extractDateTime(created) {
  let split = created.split(" ");
  return {
    "date": split[0].replaceAll(":", "-"),
    "time": split[1]
  }
}

function mapElevation(elevation) {
  let split = elevation.split(" ");
  let value = split[0] + split[1];
  return (split[2] === "Below") ? '-' + value : value;
}