const regex = {
  timezone: /^[+-]{1}[0-1]{1}[0-9]{1}:[0-5]{1}[0-9]{1}$/,
  time: /^(?:(?:([01]?\d|2[0-3]):){1}([0-5]{1}\d{1}):)([0-5]{1}\d{1})$/,
  date: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/,
  number: /^[-]?(\d*\.?\d+)$/
}

module.exports = {
  getAllRegexStrings: function() {
    let regexStrings = {};
    for (let reg of Object.keys(regex)) {
      regexStrings[reg] = regex[reg].source
    }
    return regexStrings;
  },

  validateMetadata: function (metadata, ignore = []) {
    if (!ignore.includes('date') && !isValidDate(metadata.date)) {
      return 'Invalid Date';
    }
    else if (!ignore.includes('time') && !isValidTime(metadata.time)) {
      return 'Invalid Time';
    }
    else if (!ignore.includes('timezone') && !isValidOffset(metadata.timezone) && metadata.timezone !== 'calculate') {
      return 'Invalid Timezone Offset';
    }
    else if (!ignore.includes('latitude') && !isValidLatitude(metadata.latitude)) {
      return 'Invalid Latitude';
    }
    else if (!ignore.includes('longitude') && !isValidLongitude(metadata.longitude)) {
      return 'Invalid Longitude';
    }
    else if (!ignore.includes('elevation') && !isValidElevation(metadata.elevation)) {
      return 'Invalid Elevation';
    }
    return '';
  }
}

function isValidOffset(offset) {
  return regex.timezone.test(offset);
}

function isValidDate(input) {
  if (!regex.date.test(input)) {
    return false;
  }
  const parts = input.split('-').map(part => parseInt(part, 10));
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.getFullYear() === parts[0] && date.getMonth() === (parts[1] - 1) && date.getDate() === parts[2];
}

function isValidTime(time) {
  return regex.time.test(time);
}

function isValidLatitude(latitude) {
  return regex.number.test(latitude) && latitude <= 90 && latitude >= -90;
}

function isValidLongitude(longitude) {
  return regex.number.test(longitude) && longitude <= 180 && longitude >= -180;
}

function isValidElevation(elevation) {
  return regex.number.test(elevation);
}