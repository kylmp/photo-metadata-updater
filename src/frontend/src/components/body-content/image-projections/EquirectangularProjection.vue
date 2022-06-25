<template>
  <div id="panorama"></div>
</template>

<script>
/* eslint-disable */
import { ref, watch } from 'vue'

export default {
  name: 'EquirectangularImage',
  props: ['photoName'],
  setup(props) {
    const pano = ref('undefined');

    watch(() => props.photoName, (newPhoto) => {
      if (pano.value !== 'undefined') {
        pano.value.destroy();
      }
      pano.value = pannellum.viewer('panorama', {
        "type": "equirectangular",
        "panorama": "img/"+newPhoto,
        "showZoomCtrl": false,
        "autoRotate": -10,
        "autoLoad": true
      });
    });

    return { pano };
  },
}
</script>