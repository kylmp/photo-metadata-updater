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

var map;

if (!props.apikey) {
  document.getElementById("map").innerHTML = "ERROR LOADING BING MAP: No API key";
}

// Register callback function for Bing maps api response
window.onLoadMap = () => initMap();

// Inject Bing maps api script into the DOM
let scriptTag = document.createElement("script");
scriptTag.src = `https://www.bing.com/api/maps/mapcontrol?callback=onLoadMap&key=${props.apikey}`;
scriptTag.async = true;
scriptTag.defer = true;
document.head.appendChild(scriptTag);

// Callback method for the bing maps API response, it initializes the map
// Also adds a pushpin at the coordinates point, and registers the click event handler
const initMap = () => {
  const mode = theme.global.name.value === 'lightTheme' ? Microsoft.Maps.MapTypeId.road : Microsoft.Maps.MapTypeId.aerial;
  const center = new Microsoft.Maps.Location(coordinatesStore.coordinates.lat, coordinatesStore.coordinates.lon);
  map = new Microsoft.Maps.Map(document.getElementById("map"), {
    mapTypeId: mode,
    zoom: getZoom(center),
    maxZoom: 21,
    center: center,
    maxNetworkLinkDepth: 3,
    enableClickableLogo: false,
    showMapTypeSelector: false,
    showBreadcrumb: false,
    showDashboard: false,
    showLocateMeButton: false,
    showTrafficButton: false,
    showZoomButtons: false,
    showScalebar: false,
    showTermsLink: false,
    disableStreetside: true,
    supportedMapTypes: [Microsoft.Maps.MapTypeId.road, Microsoft.Maps.MapTypeId.aerial]
  });
  map.entities.push(new Microsoft.Maps.Pushpin(center));
  Microsoft.Maps.Events.addHandler(map, 'click', handleMapClick);
};

// Update the coordinates store with new coordinates when the map is clicked
const handleMapClick = (click) => {
  coordinatesStore.update(click.location.latitude, click.location.longitude);
}

// Get zoom level: default = 10, photo with no coordinates = 1 (zoomed out)
const getZoom = (center) => {
  return (center.latitude === 0 && center.longitude === 0) ? 1 : 10;
}

// Listen to coordinates updates, and move map to new position and add a pushpin there
// If coordinates change is due to a new photo being selected, then reset the zoom level to default
coordinatesStore.$subscribe((mutation, state) => {
  if (!map) return;

  const center = new Microsoft.Maps.Location(state.coordinates.lat, state.coordinates.lon);
  let viewOptions = { center: center };
  map.setView(viewOptions);
  map.entities.clear();
  map.entities.push(new Microsoft.Maps.Pushpin(center));
});

// Listen to options changes to detect changes in theme
// Completely dispose/recreate the map if the map type id needs to change
// Note: Bing maps has bugs with map.value.setMapType(), which is why I have to do this
optionsStore.$subscribe((mutation, state)  => { 
  if (!map) return;

  let newType = state.darkTheme ? Microsoft.Maps.MapTypeId.aerial : Microsoft.Maps.MapTypeId.road;
  let opts = map.getOptions();

  if (opts.mapTypeId !== newType) {
    const center = map.getCenter();
    opts.mapTypeId = state.darkTheme ? Microsoft.Maps.MapTypeId.aerial : Microsoft.Maps.MapTypeId.road;
    map = new Microsoft.Maps.Map(document.getElementById("map"), opts);
    map.entities.push(new Microsoft.Maps.Pushpin(center));
    Microsoft.Maps.Events.addHandler(map, 'click', handleMapClick);
  }
});
</script>

<style scoped>
#map {
    height: calc(100vh - 256px);
    max-height: calc(100vh - 256px);
}
</style>