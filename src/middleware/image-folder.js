var express = require('express');

var imgFolder = createImgFolder();

function createImgFolder() {
  var static = express.static((process.pkg) ? process.cwd() : __dirname);

  const imgFolder = function (req, res, next) {
    return static(req, res, next);
  }

  imgFolder.setPath = function (newPath) {
    static = express.static(newPath);
  }

  return imgFolder;
}

module.exports = imgFolder;