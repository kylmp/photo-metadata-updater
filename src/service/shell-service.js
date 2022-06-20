const asyncShell = require('../utils/async-shell');
const exif = require('../service/exiftool-service');
const utils = require('../utils/general-utils');

const fileTypes = ['.jpg', '.jpeg', '.png'];

module.exports = {
	getPhotoList: async function(directory, recursive) {
		let photos = [];
		let depth = recursive ? '' : ' -maxdepth 1';
		for (const type of fileTypes) {
			let data = await asyncShell.exec(`find "${directory}"${depth} -name '*${type}'`).catch(err => {throw err});
			for (const file of data.split(/\r?\n/).slice(0, -1)) {
				photos.push({'path': file, 'name': utils.getPhotoNameFromFile(file)});
			}
		}
		return photos;
	},

	getPhotoListWithMetaData: async function(directory, recursive) {
		let photos = [];
		let depth = recursive ? '' : ' -maxdepth 1';
		for (const type of fileTypes) {
			let data = await asyncShell.exec(`find "${directory}"${depth} -name '*${type}'`).catch(err => {throw err});
			for (const file of data.split(/\r?\n/).slice(0, -1)) {
        let meta = await module.exports.getPhotoMetaData(file);
				photos.push(meta);
			}
		}
		return photos;
	},

	getPhotoMetaData: async function(file) {
		try {
			return await exif.getMetaData(file);
		}
		catch(error) {
			console.log("error getting exifdata - ", error);
			return {'path': file};
		}
	},
}