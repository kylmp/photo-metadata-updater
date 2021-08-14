const shell = require('shelljs');
const asyncShell = require('../utils/async-shell');
const exif = require('../service/exiftool-service');

const fileTypes = ['.jpg', '.jpeg', '.png'];

module.exports = {
	getPhotos: async function(directory, recursive) {
		let photos = [];
		let depth = recursive ? '' : ' -maxdepth 1';
		for (const type of fileTypes) {
			let data = await asyncShell.exec(`find "${directory}"${depth} -name '*${type}'`).catch(err => {throw err});
			for (const file of data.split(/\r?\n/)) {
				try {
					let r = await exif.getFullData(file);
					photos.push(r);
				}
				catch(error) {
					console.log("error getting exifdata - ", error);
				}
			};
		}
		return photos;
	}
}
