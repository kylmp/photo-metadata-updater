const shell = require('shelljs');

module.exports = {
    exec: function (command) {
        return new Promise((resolve, reject) => shell.exec(command, {silent:true}, (code, value, error) => {
            if (error) {
                reject(error);
            }
            resolve(value);
        }));
    }
}