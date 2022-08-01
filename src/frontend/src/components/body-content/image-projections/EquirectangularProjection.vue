<template>
  <div id="panorama"></div>
</template>

<script>
/* eslint-disable */
import { onMounted, ref, watch } from 'vue'

export default {
  name: 'EquirectangularImage',
  props: ['photoName'],
  setup(props) {
    const pano = ref('undefined');
    const panoConfig = ref({
      "type": "equirectangular",
      "panorama": `img/${props.photoName}`,
      "showZoomCtrl": false,
      "autoRotate": -10,
      "autoLoad": true
    });

    const buildPanorama = () => {
      if (pano.value !== 'undefined') {
        pano.value.destroy();
      }
      pano.value = pannellum.viewer('panorama', panoConfig.value);
    }

    watch(() => props.photoName, (newPhoto) => {
      panoConfig.value.panorama = `img/${newPhoto}`;
      buildPanorama();
    });

    onMounted(() => {
      buildPanorama();
    });

    return { };
  },
}
</script>