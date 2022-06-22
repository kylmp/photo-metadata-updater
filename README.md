# Photo Metadata Updater and Geotagger

Allows you to view and update photo metadata, timezone, and geotag/coordinates/location.

* Includes support for viewing equirectangular/360 photos
* Formats metadata to fix issues with google photos so photos stay in sync

Node.js application with a Vue frontend. Runs on Mac/Unix systems, not tested on Windows. This app is only made to be run locally. 

**Please make backups of all photos before using the app and editing metadata, in case of unexpected errors.**

# Required Dependencies

Ensure you have the following dependencies downloaded on your system:

* [exiftool](https://exiftool.org/install.html) - Tool used to view and edit photo metadata
* [Node.js](https://nodejs.org/en/download/) - Used to run the application
* [Bing maps](https://docs.microsoft.com/en-us/bingmaps/v8-web-control/creating-and-hosting-map-controls/) - API key required (free)

# Libraries

* [Vue.js](https://vuejs.org/) - Frontend framework
* [Vuetify](https://vuetifyjs.com/en/) - Vue UI library based on Google's material design
* [Pannellum](https://pannellum.org/) - Equirectangular image projection viewer
* [Bing Maps](https://docs.microsoft.com/en-us/bingmaps/v8-web-control/creating-and-hosting-map-controls/) - Map view and timezones API
* [Express.js](https://expressjs.com/) - Web framework for Node apps

# Build and Run Application

### Download application
1. Clone this repo
2. From the root directory of the cloned repo execute these commands:
    - `npm install` - Installs Nodejs dependencies
    - `npm run install-ui` - Installs the frontend dependencies
    - `npm run build-ui` - Builds/Compiles the frontend into the `public/` folder

### Create properies file 
1. From the root directory create a file called `.env`
2. Add the following properties:
```
BING_API_KEY={your API key}
EXIFTOOL_PATH={/path/to/exiftool}
```
* EXIFTOOL_PATH is optional and not needed if EXIFTOOL is accessable globally on your system

### Run application
Use `npm start` from the project directory or use `node <path/to/photo-metadata-updater.js>` from any directory

App should be accessible on http://localhost:8000
