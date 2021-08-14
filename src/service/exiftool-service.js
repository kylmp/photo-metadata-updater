const shell = require('shelljs');
const asyncShell = require('../utils/async-shell');

module.exports = {
	setGeotag: function(file, lat, lon) {
		if (typeof lat == 'number' && typeof lon == 'number' && (lat * -1) <= 90 && (lon * -1) <= 180) {
			let latRef = (lat < 0) ? 'S' : 'N';
			let lonRef = (lon < 0) ? 'W' : 'E';
			let cmd = `exiftool ${file} -gpslatitude=${lat}  -gpslongitude=${lon} -gpslatituderef=${latRef} -gpslongituderef=${lonRef}`;
			if (shell.exec(cmd).code === 0) {
				return true;
			}
		}
		return false;
	},

	getFullData: async function(file) {
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
		};
		let gps = infoMap.get('GPS Position');
		if (gps === undefined || gps === `0 deg 0' 0.00" N, 0 deg 0' 0.00" E`) {
			res.isGeotagged = false;
		}
		else {
			res.isGeotagged = true;	
			let geotag = convertGeotag(gps);
			res.latitude = geotag.latitude;
			res.longitude = geotag.longitude;
		}
		return res;
	}
}

function convertGeotag(geotag) {
	// Format from exiftool : 0 deg 0' 0.00" N, 0 deg 0' 0.00" E
	// Converted to array : [deg, min, sec, N/S, deg, min, sec, E/W]
	// DMS to DD coordinates: deg * (min/60) * (sec/3600)
	// N = positive, S = negative, E = positive, W = negative
	let res = {};
	gpsArr = geotag.replaceAll(' deg ', '|').replaceAll('\' ', '|').replaceAll('" ','|').replaceAll(', ','|').split('|');
	latitude = parseInt(gpsArr[0]) + parseFloat(gpsArr[1]/60) + parseFloat(gpsArr[2]/3600);
	res.latitude = (gpsArr[3] === 'S') ? latitude * -1 : latitude;
	longitude = parseInt(gpsArr[4]) + parseFloat(gpsArr[5]/60) + parseFloat(gpsArr[6]/3600);
	res.longitude = (gpsArr[7] === 'W') ? longitude * -1 : longitude;
	return res;
}