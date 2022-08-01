var express = require('express');

var imgFolder = createImgFolder('/Users/testing/photo-metadata-updater/photos');

function createImgFolder (path) {
  var static = express.static(path);

  const imgFolder = function (req, res, next) {
    return static(req, res, next);
  }

  imgFolder.setPath = function (newPath) {
    static = express.static(newPath);
  }

  return imgFolder;
}

module.exports = imgFolder;