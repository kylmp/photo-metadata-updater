<template>
    <div id="map" ref="map"></div>
</template>

<script>
/* eslint-disable */
import axios from 'axios'
import { useTheme } from 'vuetify'

export default {
  name: 'BingMap',
  props: ['coordinates'],
  data: () => ({
    map: 'undefined',
    theme: useTheme(),
  }),
  created: function() {
    // Global callback function for Bing maps api response
    window.OnLoadBingMapsApi = () => this.InitMap();

    // Inject Bing maps api script into the DOM
    axios.get('/api/bing-api-key').then((response) => {
      const apiKey = response.data;
      let scriptTag = document.createElement("script");
      scriptTag.src = "https://www.bing.com/api/maps/mapcontrol?callback=OnLoadBingMapsApi&key=" + apiKey;
      scriptTag.id = "scriptBingMaps";
      scriptTag.type = 'text/javascript';
      scriptTag.async = true;
      scriptTag.defer = true;
      document.head.appendChild(scriptTag);
    }).catch((err) => {
      document.getElementById("map").innerHTML = "ERROR LOADING MAP: "+err.response.data;
    })
  },
  methods: {
    InitMap: function() {
      const mode = this.theme.global.name === 'lightTheme' ? Microsoft.Maps.MapTypeId.road : Microsoft.Maps.MapTypeId.aerial;
      const center = new Microsoft.Maps.Location(this.$props.coordinates.latitude, this.$props.coordinates.longitude);
      const mapElement = this.$refs.map;
      this.map = new Microsoft.Maps.Map(mapElement, {
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
      this.map.entities.push(new Microsoft.Maps.Pushpin(center));
      Microsoft.Maps.Events.addHandler(this.map, 'click', this.handleMapClick);
    },
    ChangeLocation: function(latitude, longitude) {
      if (this.map !== 'undefined') {
        this.map.entities.clear();
        const center = new Microsoft.Maps.Location(latitude, longitude);
        this.map.setView({
          center: center,
        });
        this.map.entities.push(new Microsoft.Maps.Pushpin(center));
      }
    },
    handleMapClick: function(click) {
      this.$emit("update:coordinates", {
        "latitude": click.location.latitude,
        "longitude": click.location.longitude
      });
    },
  },
  watch: { 
    coordinates: async function(newCoordinates) { 
      this.ChangeLocation(newCoordinates.latitude, newCoordinates.longitude);
    }
  }
}
</script>

<style scoped>
#map {
    height: calc(100vh - 256px);
    max-height: calc(100vh - 256px);
}
</style>