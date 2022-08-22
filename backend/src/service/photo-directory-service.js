const asyncShell = require('../utils/async-shell');
const utils = require('../utils/general-utils');

const fileTypes = process.env.SUPPORTED_FILE_TYPES || ['.jpg', '.jpeg', '.png'];

module.exports = {
  getPhotoList: async function(directory) {
    let photos = [];
    for (const type of fileTypes) {
      let data = await asyncShell.exec(`find "${directory}" -name '*${type}'`).catch(err => {throw err});
      for (const file of data.split(/\r?\n/).slice(0, -1)) {
        photos.push({'name': utils.getPhotoNameFromFile(file)});
      }
    }
    return photos;
  }
}