const utils = require('../utils/general-utils');
const asyncShell = require('../utils/async-shell');
const path = require('path');
const { echo } = require('shelljs');

module.exports = {
  movePhotoToImageFolder: async function(file) {
    const command = `cp "${file}" "${getImageDirectory()}/${utils.getPhotoNameFromFile(file)}"`;
    asyncShell.exec(command).catch(err => console.log(err));;
  },

  createImageFolder: async function() {
    const command = `mkdir "${getImageDirectory()}"`;
    asyncShell.exec(command).catch(err => console.log(err));
    loadTestImage();
  },

  deleteImageFolder: async function() {
    const command = `rm -R "${getImageDirectory()}"`;
    asyncShell.exec(command).catch(err => console.log(err));
  },

  isPhotoAvailable: async function(photoName) {
    const command = `[ -f "${getImageDirectory()}/${photoName}" ] && echo true`;
    const output = await asyncShell.exec(command).catch(err => console.log(err));
    return output || "false";
  },
}

function getImageDirectory() {
  return path.join(__dirname, '../../public/img');
}

function loadTestImage() {
  if (process.env.TEST_IMG) {
    const command = `cp "${process.env.TEST_IMG}" "${getImageDirectory()}/360.jpg"`;
    asyncShell.exec(command).catch(err => console.log(err));
  }
}