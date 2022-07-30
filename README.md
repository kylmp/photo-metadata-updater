# Photo Metadata Updater and Geotagger

* Allows you to view and update photo metadata, timezone, and geotag/coordinates/location.
* Specifically built to geotag and time date images correctly to work with Google Photos.
* Includes support for viewing equirectangular/360 photos.
* Dark mode option.

*This app is only made to be run locally.*

Node.js application with a Vue frontend. Runs on Mac/Unix systems, not tested on Windows. 

### Please make backups of all photos before using the app and editing metadata, in case of unexpected errors.

![Demo](https://github.com/kylmp/photo-metadata-updater/blob/master/demo.gif)

# Required Dependencies

Ensure you have the following dependencies downloaded on your system:

* [exiftool](https://exiftool.org/install.html) - Tool used to view and edit photo metadata
* [Node.js](https://nodejs.org/en/download/) - Used to run the application
* [Bing maps API key](https://docs.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key) - Used for displaying map and timezone calculations

# Run App Guide

### Setup
1. [Download zip of the latest release](https://github.com/kylmp/photo-metadata-updater/releases/latest/download/photo-metadata-updater.zip)
2. Extract the zip into a new project directory
4. Edit the `config.properties` file and add your bing API key, and update the exiftool path (if not globally accessable on your computer)
 
### Run application
Run the command `node photo-metadata-updater.js` from the project directory, or use `node /path/to/photo-metadata-updater.js` from any directory

App will be accessible on http://localhost:8000

# Using the App

### Usage
1. Enter full system path to the directory of photos you wish to edit in the text box in the header, then press Enter
2. All JPG and/or PNG images will load into the list on the sidenav
3. Select a photo from the list to view the photo, a map of where it was taken, and the photo metadata
4. Edit the metadata as needed, these fields include:
    - Date: Local date from when the photo was taken
    - Time: Local time from when the photo was taken - *NOT UTC Time*
    - Timezone Offset: The timezone offset between the local time and UTC time
        * (e.g. Hawaii offset is -10 hours, and it is written as *-1000* using `+/-HHMM` notation)
    - Elevation: Elevation in meters of where photo was taken (negative or positive, including decimal values)
    - Latitude: GPS latitude of where the photo was taken
    - Longitude: GPS longitude of where the photo was taken
6. Click 'Save' to save the metadata

Tip 1: Click the search icon next to timezone offset field to calculate timezone offset based on the GPS and date/time information

Tip 2: You can either click on the map itself to select new coordinates, or enter them manually in the text boxes

### EXIF/Metadata information

This application writes to the following EXIF metadata fields: 

1. `Create Date` (local time)
2. `Date/Time Original` (local time)
3. `GPS Altitude` (elevation in meters)
4. `GPS Date/Time` (UTC datetime)
5. `GPS Date` (UTC date)
6. `GPS Time` (UTC time)
7. `GPS Latitude` 
8. `GPS Longitude`
9. `GPS Latitude Ref` (N or S)
10. `GPS Longitude Ref` (W or E)

# Libraries Used

* [Vue.js](https://vuejs.org/) - Frontend framework
* [Vuetify](https://vuetifyjs.com/en/) - Vue UI library based on Google's material design
* [Pannellum](https://pannellum.org/) - Equirectangular image projection viewer
* [Bing Maps](https://docs.microsoft.com/en-us/bingmaps/v8-web-control/creating-and-hosting-map-controls/) - Map view and timezones API
* [Axios](https://axios-http.com/docs/intro) - HTTP Client
* [Express.js](https://expressjs.com/) - Web framework for Node apps
