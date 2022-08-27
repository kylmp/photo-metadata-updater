const utils = require('../utils/general-utils');
const asyncShell = require('../utils/async-shell');
const imgFolder = require('../middleware/image-folder');

const supportedImageTypes = process.env.SUPPORTED_FILE_TYPES || ['.jpg', '.jpeg', '.png'];

var directory = '';
var photos = [];

module.exports = {
  getDirectory: function() {
    return directory;
  },

  getPhotos: function() {
    return photos;
  },

  setDirectory: async function(dir) {
    const loadImageFiles = supportedImageTypes.map(type => asyncShell.exec(`find "${dir}" -name '*${type}'`));
    return Promise.all(loadImageFiles).then(imageFileResults => {
      directory = dir;
      imgFolder.setPath(dir);
      photos = imageFileResults
        .map(imageTypeResults => imageTypeResults.split(/\r?\n/).slice(0, -1))
        .flat()
        .map(photoFile => utils.getPhotoNameFromFile(photoFile))
        .map(photoName => ({'name': photoName}))
        .sort((a, b) => a.name.localeCompare(b.name));
      return 200;
    }).catch(err => {
      console.log(err)
      return ((typeof err === 'string' || err instanceof String) && err.includes("No such file")) ? 400 : 500;
    });
  }
}
