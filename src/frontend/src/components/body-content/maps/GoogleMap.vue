<template>
    <div id="map" ref="map"></div>
</template>

<script>
/* eslint-disable */
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import { useCoordinatesStore } from '../../../stores/coordinatesStore';

export default {
  name: 'GoogleMap',
  props: ['apikey'],
  setup(props) {
    const theme = useTheme();
    const coordinatesStore = useCoordinatesStore();
    const map = ref();

    if (!props.apikey) {
      document.getElementById("map").innerHTML = "ERROR LOADING MAP: No API key";
    }

    // Global callback function for Bing maps api response
    window.OnLoadBingMapsApi = () => initMap();

    // Inject Bing maps api script into the DOM
    let scriptTag = document.createElement("script");
    scriptTag.src = "https://www.bing.com/api/maps/mapcontrol?callback=OnLoadBingMapsApi&key=" + props.apikey;
    scriptTag.id = "scriptBingMaps";
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.defer = true;
    document.head.appendChild(scriptTag);

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
        showLocateMeButton: false,
        showTrafficButton: false,
        showZoomButtons: false,
        disableStreetside: true,
        supportedMapTypes: [Microsoft.Maps.MapTypeId.road, Microsoft.Maps.MapTypeId.aerial]
      });
      map.value.entities.push(new Microsoft.Maps.Pushpin(center));
      Microsoft.Maps.Events.addHandler(map.value, 'click', handleMapClick);
    };

    const handleMapClick = (click) => {
      coordinatesStore.update(click.location.latitude, click.location.longitude);
    }

    coordinatesStore.$subscribe((mutation, state) => {
      if (map.value !== 'undefined') {
        map.value.entities.clear();
        const center = new Microsoft.Maps.Location(state.coordinates.lat, state.coordinates.lon);
        map.value.setView({ center: center });
        map.value.entities.push(new Microsoft.Maps.Pushpin(center));
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