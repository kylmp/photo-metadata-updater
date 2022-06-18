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

	getMetaData: async function(file) {
		let infoMap = new Map();
		let data = await asyncShell.exec(`exiftool "${file}"`).catch(err => {throw err});
		data.split(/\r?\n/).forEach((item) => {
			let tmp = item.split(': ');
			infoMap.set(tmp[0].trim(), tmp[1]);
		});
		let res = { 
			'name': infoMap.get('File Name'), 
			'path': file,
			'type': infoMap.get('File Type'),
			'size': infoMap.get('File Size'),
			'camera': infoMap.get('Camera Model Name'),
			'created': infoMap.get('Create Date'),
			'resolution': infoMap.get('Image Size'),
			'projection': infoMap.get('Projection Type'),
			'coordinates': coordinatesUtils.geotagToCoordinates(infoMap.get('GPS Position')),
		};
		res.isGeotagged = (res.coordinates.latitude === 0 && res.coordinates.longitude === 0) ? false : true;
		res.isHdr = res.name.includes("HDR");
		return res;
	}
}
