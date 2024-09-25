# Photo Metadata Updater and Geotagger

* View and update photo metadata, timezone, and geotag/coordinates/location
* Able to batch update photos in bulk based on extensive array of filters
* Built to geotag and time date images correctly to work with Google Photos
* Supports viewing equirectangular/360 photos
* Dark mode option

*This app is only meant to be run locally on your own computer*

Node.js backend, Vue.js frontend. Runs on Mac/Unix systems, not tested on Windows. 

### Please make backups of all photos before using the app and editing metadata, in case of unexpected errors.

# Run App Guide

1. Download the [latest release](https://github.com/kylmp/photo-metadata-updater/releases/latest) based on your system
2. Extract the zip to a new directory
3. (Highly recommended, not required) Add your [Bing maps API key](https://docs.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key) to the `config.properties` file
4. Run the `photo-metadata-updater` file, you will see a console window open
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
        * (e.g. Hawaii offset is -10 hours, and it is written as *-10:00* using `+/-HH:MM` notation)
    - Elevation: Elevation in meters of where photo was taken (negative or positive, including decimal values)
    - Latitude: GPS latitude of where the photo was taken
    - Longitude: GPS longitude of where the photo was taken
6. Click 'Save' to save the metadata

Tip 1: Click the search icon next to timezone offset field to calculate timezone offset based on the GPS and date/time information

Tip 2: You can either click on the map itself to select new coordinates, or enter them manually in the text boxes

Tip 3: You can paste coordinates in decimal degrees format "latitude, longitude" in either the latitude or longitude fields, and the app will automatically detect this and populate both coordinates values for you automatically

Tip 4: You can disable warnings, or change to dark mode in the options menu (top left corner)

# EXIF/Metadata information

This application writes to the following EXIF metadata fields: 

1. `Create Date` (local time)
2. `Date/Time Original` (local time)
3. `Modify Date` (local time)
4. `GPS Altitude` (elevation in meters)
5. `GPS Altitude Ref` (Above/Below Sea Level)
6. `GPS Date/Time` (UTC datetime)
7. `GPS Date` (UTC date)
8. `GPS Time` (UTC time)
9. `GPS Latitude` (decimal degrees)
10. `GPS Longitude` (decimal degrees)
11. `GPS Latitude Ref` (N or S)
12. `GPS Longitude Ref` (W or E)
13. `Offset Time` (timezone offset - corresponds to `Modify Date`)
14. `Offset Time Original` (timezone offset - corresponds to `Date/Time Original`)
15. `Offset Time Digitized` (timezone offset - corresponds to `Create Date`)

# Libraries/Resources Used

* [Exiftool](https://exiftool.org/install.html) - Tool used to view and edit photo metadata
* [Vue.js](https://vuejs.org/) - Frontend framework
* [Vuetify](https://vuetifyjs.com/en/) - Vue UI library based on Google's material design
* [Vite](https://vitejs.dev/) - Frontend tooling
* [Pannellum](https://pannellum.org/) - Equirectangular image projection viewer
* [SSE](https://github.com/mpetazzoni/sse.js) - Eventsource SSE alternative
* [Bing Maps](https://docs.microsoft.com/en-us/bingmaps/v8-web-control/creating-and-hosting-map-controls/) - Map view and timezones API
* [Axios](https://axios-http.com/docs/intro) - HTTP Client
* [Express.js](https://expressjs.com/) - Web framework for Node apps
* [pkg](https://github.com/vercel/pkg) - Enables packaging node apps into executables
