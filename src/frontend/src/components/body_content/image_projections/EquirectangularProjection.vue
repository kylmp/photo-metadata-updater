<template>
  <div id="panorama"></div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'EquirectangularImage',
  props: ['photoName'],
  data: () => ({
    pano: 'undefined',
  }),
  watch: { 
    photoName: async function(newPhoto) { 
      if (this.pano !== 'undefined') {
        this.pano.destroy();
      }
      this.pano = pannellum.viewer('panorama', {
        "type": "equirectangular",
        "panorama": "img/"+newPhoto,
        "showZoomCtrl": false,
        "autoRotate": -10,
        "autoLoad": true
      });
    }
  }
}
</script>

<style scoped>
</style>