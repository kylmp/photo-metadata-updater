<template>
  <div id="map"></div>
</template>

<script setup>
import { useTheme } from 'vuetify'
import { useCoordinatesStore } from '../../../stores/coordinatesStore';
import { useOptionsStore } from '../../../stores/optionsStore';

const props = defineProps(['apikey']);

const theme = useTheme();
const coordinatesStore = useCoordinatesStore();
const optionsStore = useOptionsStore();

const darkThemeOption = 'hybrid';
const lightThemeOption = 'roadmap';
const defaultZoom = 10;

var map;
var pushpin;

if (!props.apikey) {
  document.getElementById("map").innerHTML = "ERROR LOADING GOOGLE MAP: No API key";
}

// Register callback function for Google maps api response
window.onLoadMap = () => initMap();

// Inject Google maps api script into the DOM
let scriptTag = document.createElement("script");
scriptTag.src = `https://maps.googleapis.com/maps/api/js?key=${props.apikey}&callback=onLoadMap`;
scriptTag.async = true;
scriptTag.defer = true;
document.head.appendChild(scriptTag);

// Callback method for the bing maps API response, it initializes the map
// Also adds a pushpin at the coordinates point, and registers the click event handler
const initMap = () => {
  const mode = theme.global.name.value === 'lightTheme' ? lightThemeOption : darkThemeOption;
  const center = new google.maps.LatLng(coordinatesStore.coordinates.lat, coordinatesStore.coordinates.lon);
  map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: getZoom(center),
    mapTypeId: mode,
    mapTypeControlOptions: {
      mapTypeIds: [lightThemeOption, darkThemeOption]
    },
    clickableIcons: false,
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl: false,
    mapTypeControl: false,
    draggableCursor:'default'
  });
  pushpin = new google.maps.Marker({ position: center, clickable: false, map: map });
  map.addListener("click", (click) => { coordinatesStore.update(click.latLng.lat(), click.latLng.lng()); });
};

// Get zoom level - default or zoomed out (if no coordinates)
const getZoom = (center) => {
  return (center.lat() === 0 && center.lng() === 0) ? 2 : defaultZoom;
}

// Listen to coordinates updates, and move map to new position and add a pushpin there
// If coordinates change is due to a new photo being selected, then reset the zoom level to default
coordinatesStore.$subscribe((mutation, state) => {
  if (map) {
    const center = new google.maps.LatLng(state.coordinates.lat, state.coordinates.lon);
    map.panTo(center);
    pushpin.setPosition(center);
  }
});

// Listen to options changes to detect changes in theme
optionsStore.$subscribe((mutation, state)  => { 
  map.setMapTypeId(state.darkTheme ? darkThemeOption : lightThemeOption);
});
</script>

<style scoped>
#map {
    height: calc(100vh - 256px);
    max-height: calc(100vh - 256px);
    max-width: none;
}
</style>