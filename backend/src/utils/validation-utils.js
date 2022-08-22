const regex = require('../constants/regex');

module.exports = {
  isValidOffset: function(offset) {
    return regex.get('timezone').test(offset);
  },

  isValidDate: function(input) {
    if (!regex.get('date').test(input)) {
      return false;
    }
    const parts = input.split('-').map(part => parseInt(part, 10));
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.getFullYear() === parts[0] && date.getMonth() === (parts[1] - 1) && date.getDate() === parts[2];
  },

  isValidTime: function(time) {
    return regex.get('time').test(time);
  },

  isValidLatitude: function (latitude) {
    return regex.get('number').test(latitude) && latitude <= 90 && latitude >= -90;
  },

  isValidLongitude: function (longitude) {
    return regex.get('number').test(longitude) && longitude <= 180 && longitude >= -180;
  },

  isValidElevation: function (elevation) {
    return regex.get('number').test(elevation);
  },

  validateMetadata: function (metadata, ignore = []) {
    if (!ignore.includes('date') && !module.exports.isValidDate(metadata.date)) {
      return 'Invalid Date';
    }
    else if (!ignore.includes('time') && !module.exports.isValidTime(metadata.time)) {
      return 'Invalid Time';
    }
    else if (!ignore.includes('timezone') && !module.exports.isValidOffset(metadata.timezone) && metadata.timezone !== 'calculate') {
      return 'Invalid Timezone Offset';
    }
    else if (!ignore.includes('latitude') && !module.exports.isValidLatitude(metadata.latitude)) {
      return 'Invalid Latitude';
    }
    else if (!ignore.includes('longitude') && !module.exports.isValidLongitude(metadata.longitude)) {
      return 'Invalid Longitude';
    }
    else if (!ignore.includes('elevation') && !module.exports.isValidElevation(metadata.elevation)) {
      return 'Invalid Elevation';
    }
    return '';
  }
}