const imgFolder = require('../middleware/image-folder');

var directory = '';

module.exports = {
  getDirectory: function() {
    return directory;
  },

  setDirectory: function(dir) {
    if (require('fs').existsSync(dir)) {
      directory = dir;
      imgFolder.setPath(dir);
      return 200;
    }
    return 400;
  }
}
