module.exports = {
  // Format from exiftool : 0 deg 0' 0.00" N, 0 deg 0' 0.00" E
  // Converted to array : [deg, min, sec, N/S, deg, min, sec, E/W]
  // DMS to DD coordinates: deg * (min/60) * (sec/3600)
  // N = positive, S = negative, E = positive, W = negative
  geotagToCoordinates: function (geotag) {
    let coordinates = {latitude: 0, longitude: 0};
    if (geotag === undefined) {
      return coordinates;
    }
    gpsArr = geotag.replaceAll(' deg ', '|').replaceAll('\' ', '|').replaceAll('" ','|').replaceAll(', ','|').split('|');
    latitude = parseInt(gpsArr[0]) + parseFloat(gpsArr[1]/60) + parseFloat(gpsArr[2]/3600);
    coordinates.latitude = (gpsArr[3] === 'S') ? latitude * -1 : latitude;
    longitude = parseInt(gpsArr[4]) + parseFloat(gpsArr[5]/60) + parseFloat(gpsArr[6]/3600);
    coordinates.longitude = (gpsArr[7] === 'W') ? longitude * -1 : longitude;
    return coordinates;
  }
}
