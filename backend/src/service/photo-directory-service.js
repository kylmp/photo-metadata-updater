const asyncShell = require('../utils/async-shell');
const exif = require('../service/exiftool-service');
const utils = require('../utils/general-utils');

const fileTypes = ['.jpg', '.jpeg', '.png'];

module.exports = {
  getPhotoList: async function(directory, withMetadata = false, recursive = false) {
    let photos = [];
    let depth = recursive ? '' : ' -maxdepth 1';
    for (const type of fileTypes) {
      let data = await asyncShell.exec(`find "${directory}"${depth} -name '*${type}'`).catch(err => {throw err});
      for (const file of data.split(/\r?\n/).slice(0, -1)) {
        const photoInfo = (withMetadata) ? await module.exports.getPhotoMetadata(file) : getBasicInfo(file);
        photos.push(photoInfo);
      }
    }
    return photos;
  },

  getPhotoMetadata: async function(photoFile) {
    return await exif.getMetadata(photoFile).catch(err => {throw err});
  },
}

function getBasicInfo(file) {
  return {'name': utils.getPhotoNameFromFile(file)};
}