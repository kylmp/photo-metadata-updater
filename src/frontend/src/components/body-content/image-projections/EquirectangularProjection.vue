<template>
  <div id="panorama"></div>
</template>

<script setup>
import '../../../assets/pannellum';
import { onMounted, watch } from 'vue'

const props = defineProps(['photoName']);

var panorama;
var panoramaConfig = {
  "type": "equirectangular",
  "panorama": `img/${props.photoName}`,
  "showZoomCtrl": false,
  "autoRotate": -10,
  "autoLoad": true
};

const buildPanorama = () => {
  if (panorama) {
    panorama.destroy();
  }
  panorama = pannellum.viewer('panorama', panoramaConfig);
}

watch(() => props.photoName, (newPhoto) => {
  panoramaConfig.panorama = `img/${newPhoto}`;
  buildPanorama();
});

onMounted(() => {
  buildPanorama();
});
</script>

<style>
  @import '../../../assets/pannellum.css';
</style>