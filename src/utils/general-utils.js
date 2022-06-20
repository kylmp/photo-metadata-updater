module.exports = {
  getPhotoNameFromFile: function(file) {
    let pathElements = file.split('/');
    return pathElements[pathElements.length - 1];
  }
}