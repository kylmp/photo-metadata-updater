const express = require('express');
const imgFolder = createImgFolder();

function createImgFolder() {
  var static = express.static((process.pkg) ? process.cwd() : __dirname);

  const folder = function (req, res, next) {
    return static(req, res, next);
  }

  folder.setPath = function (newPath) {
    static = express.static(newPath);
  }

  return folder;
}

module.exports = imgFolder;
