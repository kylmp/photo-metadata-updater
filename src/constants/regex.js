const regex = {
  timezone: /^[+-]{1}[0-1]{1}[0-9]{1}:[0-5]{1}[0-9]{1}$/,
  time: /^(?:(?:([01]?\d|2[0-3]):){1}([0-5]{1}\d{1}):)([0-5]{1}\d{1})$/,
  date: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/,
  number: /^[-]?([0-9]+\.?[0-9]*|\.[0-9]+)?$/
}

module.exports = {
  get: function(key) {
    return regex[key];
  },

  getAllStrings: function() {
    let regexStrings = {};
    for (let reg of Object.keys(regex)) {
      regexStrings[reg] = regex[reg].source
    }
    return regexStrings;
  }
}