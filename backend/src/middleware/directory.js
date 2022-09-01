const express = require('express');
const fileSystem = require('fs');

var directory = (process.env.DEMO_MODE === 'true') ? process.env.DEMO_DIR : (process.pkg) ? process.cwd() : __dirname;
var static = express.static(directory);

const selctedDirectory = (req, res, next) => {
  return static(req, res, next);
}

selctedDirectory.update = (newDirectory) => {
  if (directory === newDirectory) return true;
  if (!fileSystem.existsSync(newDirectory)) return false;
  
  directory = newDirectory;
  static = express.static(newDirectory);
  return true;
}

selctedDirectory.get = () => {
  return directory;
}

module.exports = selctedDirectory;
