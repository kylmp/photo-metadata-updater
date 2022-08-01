# Photo Metadata Updater and Geotagger

* Allows you to view and update photo metadata, timezone, and geotag/coordinates/location.
* Specifically built to geotag and time date images correctly to work with Google Photos.
* Includes support for viewing equirectangular/360 photos.
* Dark mode option.

*This app is only made to be run locally.*

Node.js application with a Vue frontend. Runs on Mac/Unix systems, not tested on Windows. 

### Please make backups of all photos before using the app and editing metadata, in case of unexpected errors.

![Demo](https://github.com/kylmp/photo-metadata-updater/blob/master/demo.gif)

# Recommended Dependency

In order to take advantage of timezone and map features, you need a [Bing maps API key](https://docs.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key). Go to the link to get one, then save it in the app after startup.

# Run App Guide

1. Download the latest release: [Mac](https://github.com/kylmp/photo-metadata-updater/releases/latest/download/photo-metadata-updater-macos.zip) - [Linux](https://github.com/kylmp/photo-metadata-updater/releases/latest/download/photo-metadata-updater-linux.zip)
2. Extract the zip to a new directory
3. (Recommended, not required) Add your [Bing maps API key](https://docs.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key) to the `config.properties` file
4. Double click the `photo-metadata-updater` file, you will see a console window open
5. In a browser, navigate to http://localhost:8000

If you want to contribute, instructions for local setup for development is in the [wiki](https://github.com/kylmp/photo-metadata-updater/wiki/Local-Setup-(Development))

# Using the App

### Usage
1. Enter full system path to the directory of photos you wish to edit in the text box in the header, then press Enter
2. All JPG and/or PNG images will load into the list on the side bar
3. Select a photo from the list to view the photo, a map of where it was taken, and the photo metadata
4. Edit the metadata fields as needed, these fields include:
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

Tip 3: You can disable warnings, or change to dark mode in the options menu (top left corner)

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

* [Exiftool](https://exiftool.org/install.html) - Tool used to view and edit photo metadata
* [Vue.js](https://vuejs.org/) - Frontend framework
* [Vuetify](https://vuetifyjs.com/en/) - Vue UI library based on Google's material design
* [Pannellum](https://pannellum.org/) - Equirectangular image projection viewer
* [Bing Maps](https://docs.microsoft.com/en-us/bingmaps/v8-web-control/creating-and-hosting-map-controls/) - Map view and timezones API
* [Axios](https://axios-http.com/docs/intro) - HTTP Client
* [Express.js](https://expressjs.com/) - Web framework for Node apps
* [pkg](https://github.com/vercel/pkg) - Enables packaging node apps into executables
