<template>
    <div id="map"></div>
</template>

<script>
/* eslint-disable */
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import { useCoordinatesStore } from '../../../stores/coordinatesStore';
import { useOptionsStore } from '../../../stores/optionsStore';

export default {
  name: 'BingMap',
  props: ['apikey'],
  setup(props) {
    const theme = useTheme();
    const coordinatesStore = useCoordinatesStore();
    const optionsStore = useOptionsStore();
    const map = ref();

    if (!props.apikey) {
      document.getElementById("map").innerHTML = "ERROR LOADING MAP: No API key";
    }

    // Register callback function for Bing maps api response
    window.OnLoadBingMapsApi = () => initMap();

    // Inject Bing maps api script into the DOM
    let scriptTag = document.createElement("script");
    scriptTag.src = "https://www.bing.com/api/maps/mapcontrol?callback=OnLoadBingMapsApi&key=" + props.apikey;
    scriptTag.id = "scriptBingMaps";
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.defer = true;
    document.head.appendChild(scriptTag);

    // Callback method for the bing maps API response, it initializes the map
    // Also adds a pushpin at the coordinates point, and registers the click event handler
    const initMap = () => {
      const mode = theme.global.name.value === 'lightTheme' ? Microsoft.Maps.MapTypeId.road : Microsoft.Maps.MapTypeId.aerial;
      const center = new Microsoft.Maps.Location(coordinatesStore.coordinates.lat, coordinatesStore.coordinates.lon);
      map.value = new Microsoft.Maps.Map(document.getElementById("map"), {
        mapTypeId: mode,
        zoom: 10,
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
      map.value.entities.push(new Microsoft.Maps.Pushpin(center));
      Microsoft.Maps.Events.addHandler(map.value, 'click', handleMapClick);
    };

    // Update the coordinates store with new coordinates when the map is clicked
    const handleMapClick = (click) => {
      coordinatesStore.update(click.location.latitude, click.location.longitude);
    }

    // Listen to coordinates updates, and move map to new position and add a pushpin there
    // If coordinates change is due to a new photo being selected, then reset the zoom level to default
    coordinatesStore.$subscribe((mutation, state) => {
      if (map.value) {
        const center = new Microsoft.Maps.Location(state.coordinates.lat, state.coordinates.lon);
        let viewOptions = { center: center };
        if (state.isNewPhoto) {
          viewOptions.zoom = 10;
        }
        map.value.setView(viewOptions);

        map.value.entities.clear();
        map.value.entities.push(new Microsoft.Maps.Pushpin(center));
      }
    });

    // Listen to options changes to detect changes in theme
    // Completely dispose/recreate the map if the map type id needs to change
    // Note: Bing maps has bugs with map.value.setMapType(), which is why I have to do this
    optionsStore.$subscribe((mutation, state)  => { 
      let newType = state.darkTheme ? Microsoft.Maps.MapTypeId.aerial : Microsoft.Maps.MapTypeId.road;
      let opts = map.value.getOptions();

      if (opts.mapTypeId !== newType) {
        const center = map.value.getCenter();
        opts.mapTypeId = state.darkTheme ? Microsoft.Maps.MapTypeId.aerial : Microsoft.Maps.MapTypeId.road;
        map.value = new Microsoft.Maps.Map(document.getElementById("map"), opts);
        map.value.entities.push(new Microsoft.Maps.Pushpin(center));
        Microsoft.Maps.Events.addHandler(map.value, 'click', handleMapClick);
      }
    });
  }
}
</script>

<style scoped>
#map {
    height: calc(100vh - 256px);
    max-height: calc(100vh - 256px);
}
</style>