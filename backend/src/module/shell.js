const shell = require('shelljs');

module.exports = {
  async: function (command) {
    return new Promise((resolve, reject) => shell.exec(command, {silent:true}, (code, value, error) => {
      if (error) {
        reject(error);
      }
      resolve(value);
    }));
  },

  sync: function(command) {
    return shell.exec(command, {silent: true});
  }
}
