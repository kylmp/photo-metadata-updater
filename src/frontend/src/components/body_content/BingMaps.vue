<template>
    <div id="map" ref="map"></div>
</template>

<script>
/* eslint-disable */
import axios from 'axios'

export default {
  name: 'BingMaps',
  mounted: function() {
    // map already loaded check
    if (document.getElementById("scriptBingMaps")) {
      return; 
    }

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
    })
  },
  methods: {
    InitMap: function() {
      var mapElement = this.$refs.map;

      this.map = new Microsoft.Maps.Map(mapElement, {
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        zoom: 10,
        maxZoom: 21,
        center: new Microsoft.Maps.Location(57.416504, -6.194331),
        maxNetworkLinkDepth: 3
      });
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