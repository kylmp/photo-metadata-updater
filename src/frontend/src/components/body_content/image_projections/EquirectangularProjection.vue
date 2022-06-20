<template>
  <div id="panorama"></div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'EquirectangularImage',
  mounted: function() {
    pannellum.viewer('panorama', {
      "type": "equirectangular",
      "panorama": "img/360.jpg",
      "autoLoad": true
    });
  }
}
</script>

<style scoped>
</style>